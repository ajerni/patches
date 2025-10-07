import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Delete any existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      });

      // Also clean up expired tokens while we're at it
      await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Create password reset token (expires in 1 hour)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // Send password reset email
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetToken,
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Delete the token if email fails
        await prisma.passwordResetToken.deleteMany({
          where: { token: resetToken },
        });
        return NextResponse.json(
          { error: "Failed to send reset email. Please try again later." },
          { status: 500 }
        );
      }
    }

    // Always return success message to prevent user enumeration
    return NextResponse.json({
      message: "If an account exists with that email, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

