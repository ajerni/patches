"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Plus } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface ModuleFormProps {
  module?: {
    id: string;
    manufacturer: string;
    name: string;
    types?: string[];
    notes?: string;
    images?: string[];
  };
  isEdit?: boolean;
}

export function ModuleForm({ module, isEdit = false }: ModuleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [manufacturer, setManufacturer] = useState(module?.manufacturer || "");
  const [name, setName] = useState(module?.name || "");
  const [types, setTypes] = useState<string[]>(module?.types || []);
  const [notes, setNotes] = useState(module?.notes || "");
  const [images, setImages] = useState<string[]>(module?.images || []);
  const [newType, setNewType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = {
      manufacturer,
      name,
      types,
      notes: notes || undefined,
      images,
    };

    try {
      const url = isEdit ? `/api/modules/${module?.id}` : "/api/modules";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Something went wrong");
      } else {
        const result = await res.json();
        router.push(`/modules/${result.id}`);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addType = () => {
    if (newType.trim() && !types.includes(newType.trim())) {
      setTypes([...types, newType.trim()]);
      setNewType("");
    }
  };

  const removeType = (type: string) => {
    setTypes(types.filter((t) => t !== type));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Manufacturer */}
      <div>
        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
          Manufacturer *
        </label>
        <input
          id="manufacturer"
          type="text"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Mutable Instruments, Make Noise, etc."
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Module Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Plaits, Maths, Clouds, etc."
        />
      </div>

      {/* Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Types / Categories</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addType())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="VCO, Filter, ADSR Envelope, LFO, etc."
          />
          <button
            type="button"
            onClick={addType}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {type}
              <button type="button" onClick={() => removeType(type)}>
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Personal notes about this module..."
        />
      </div>

      {/* Images */}
      <div className="mt-12 mb-12">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Upload photos of your module (front panel, back, in your rack, etc.)
        </p>
        <ImageUpload 
          images={images} 
          onImagesChange={setImages}
          folder="/modules"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white hover:bg-primary-700 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Saving..." : isEdit ? "Update Module" : "Add Module"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}


