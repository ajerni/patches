"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { PatchForm } from "@/components/PatchForm";
import { Music } from "lucide-react";

interface Patch {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  notes?: string;
  tags: string[];
  images: string[];
  sounds: string[];
  private: boolean;
}

export default function EditPatchPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [patch, setPatch] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPatch();
    }
  }, [status, params.id]);

  const fetchPatch = async () => {
    try {
      const res = await fetch(`/api/patches/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPatch(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch patch:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Music className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading patch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Patch</h1>
          <p className="text-gray-600">Update your patch documentation</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PatchForm patch={patch} isEdit={true} />
        </div>
      </main>
    </div>
  );
}

