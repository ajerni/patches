"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ModuleForm } from "@/components/ModuleForm";
import { Boxes } from "lucide-react";

interface Module {
  id: string;
  manufacturer: string;
  name: string;
  type?: string;
  notes?: string;
  images?: string[];
}

export default function EditModulePage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchModule();
    }
  }, [status, params.id]);

  const fetchModule = async () => {
    try {
      const res = await fetch(`/api/modules/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setModule(data);
      } else {
        router.push("/modules");
      }
    } catch (error) {
      console.error("Failed to fetch module:", error);
      router.push("/modules");
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
            <Boxes className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading module...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Module</h1>
          <p className="text-gray-600">Update module information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ModuleForm module={module} isEdit={true} />
        </div>
      </main>
    </div>
  );
}


