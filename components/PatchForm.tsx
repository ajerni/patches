"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2, Network } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { ModuleSelector } from "./ModuleSelector";
import dynamic from "next/dynamic";
import { SchemaData } from "./PatchSchemaEditor";

// Dynamically import the schema editor to avoid SSR issues with canvas
const PatchSchemaEditor = dynamic(() => import("./PatchSchemaEditor"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

interface PatchFormProps {
  patch?: {
    id: string;
    title: string;
    description: string;
    instructions?: string;
    notes?: string;
    tags: string[];
    images: string[];
    sounds: string[];
    schema?: any;
    patchModules?: Array<{
      module: {
        id: string;
        manufacturer: string;
        name: string;
        type?: string;
      };
    }>;
  };
  isEdit?: boolean;
}

export function PatchForm({ patch, isEdit = false }: PatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(patch?.title || "");
  const [description, setDescription] = useState(patch?.description || "");
  const [instructions, setInstructions] = useState(patch?.instructions || "");
  const [notes, setNotes] = useState(patch?.notes || "");
  const [tags, setTags] = useState<string[]>(patch?.tags || []);
  const [images, setImages] = useState<string[]>(patch?.images || []);
  const [sounds, setSounds] = useState<string[]>(patch?.sounds || []);
  const [moduleIds, setModuleIds] = useState<string[]>(
    patch?.patchModules?.map((pm) => pm.module.id) || []
  );
  const [schema, setSchema] = useState<SchemaData | null>(patch?.schema || null);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);

  const [newTag, setNewTag] = useState("");
  const [newSound, setNewSound] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = {
      title,
      description,
      instructions: instructions || undefined,
      notes: notes || undefined,
      tags,
      images,
      sounds,
      moduleIds,
      schema,
    };

    try {
      const url = isEdit ? `/api/patches/${patch?.id}` : "/api/patches";
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
        router.push(`/patches/${result.id}`);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addSound = () => {
    if (!newSound.trim()) return;
    
    const url = newSound.trim();
    
    // If already in the list, skip
    if (sounds.includes(url)) {
      setNewSound("");
      return;
    }

    // Just add the URL as-is - conversion happens on display
    setSounds([...sounds, url]);
    setNewSound("");
  };

  const removeSound = (sound: string) => {
    setSounds(sounds.filter((s) => s !== sound));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="My awesome patch"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe what this patch does..."
        />
      </div>

      {/* Modules Used */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modules Used
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Select which modules from your collection are used in this patch
        </p>
        <ModuleSelector 
          selectedModuleIds={moduleIds}
          onModulesChange={setModuleIds}
        />
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Step-by-step instructions to recreate this patch..."
        />
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
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any additional notes or observations..."
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patch Images
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Upload images of your patch cables and module setup
        </p>
        <ImageUpload images={images} onImagesChange={setImages} />
      </div>

      {/* Patch Schema Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patch Schema
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Create a visual diagram of your patch using module symbols and colored cables
        </p>
        <button
          type="button"
          onClick={() => setShowSchemaEditor(true)}
          className="flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Network className="h-5 w-5" />
          {schema ? "Edit Schema" : "Create Schema"}
        </button>
        {schema && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ Schema saved ({schema.symbols.length} symbols, {schema.cables.length} cables)
          </div>
        )}
      </div>

      {/* Sounds */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audio Examples (hearthis.at)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Paste hearthis.at URLs or embed codes. Audio will be embedded in the patch detail page.
          <br />
          <span className="text-xs">
            Example: https://hearthis.at/username/trackname/ or https://app.hearthis.at/embed/12835855/...
          </span>
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={newSound}
            onChange={(e) => setNewSound(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSound())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://hearthis.at/username/trackname/"
          />
          <button
            type="button"
            onClick={addSound}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {sounds.map((sound, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <a
                href={sound}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline truncate flex-1"
              >
                {sound}
              </a>
              <button
                type="button"
                onClick={() => removeSound(sound)}
                className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white hover:bg-primary-700 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Saving..." : isEdit ? "Update Patch" : "Create Patch"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
        >
          Cancel
        </button>
      </div>

      {/* Schema Editor Modal */}
      {showSchemaEditor && (
        <PatchSchemaEditor
          initialSchema={schema}
          onSave={(newSchema) => {
            setSchema(newSchema);
            setShowSchemaEditor(false);
          }}
          onClose={() => setShowSchemaEditor(false)}
        />
      )}
    </form>
  );
}

