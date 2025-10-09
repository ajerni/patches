"use client";

import { useState, useEffect } from "react";
import { Search, X, Check } from "lucide-react";

interface Module {
  id: string;
  manufacturer: string;
  name: string;
  types?: string[];
}

interface ModuleSelectorProps {
  selectedModuleIds: string[];
  onModulesChange: (moduleIds: string[]) => void;
}

export function ModuleSelector({ selectedModuleIds, onModulesChange }: ModuleSelectorProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedModules = modules.filter((m) => selectedModuleIds.includes(m.id));
  
  const filteredModules = modules.filter((module) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      module.manufacturer.toLowerCase().includes(searchLower) ||
      module.name.toLowerCase().includes(searchLower) ||
      module.types?.some(type => type.toLowerCase().includes(searchLower))
    );
  });

  const toggleModule = (moduleId: string) => {
    if (selectedModuleIds.includes(moduleId)) {
      onModulesChange(selectedModuleIds.filter((id) => id !== moduleId));
    } else {
      onModulesChange([...selectedModuleIds, moduleId]);
    }
  };

  const removeModule = (moduleId: string) => {
    onModulesChange(selectedModuleIds.filter((id) => id !== moduleId));
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Loading modules...</div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          No modules found. Add modules to your collection first to use them in patches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Modules (Chips) */}
      {selectedModules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedModules.map((module) => (
            <div
              key={module.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              <span className="font-medium">{module.manufacturer}</span>
              <span>-</span>
              <span>{module.name}</span>
              <button
                type="button"
                onClick={() => removeModule(module.id)}
                className="hover:bg-primary-200 rounded-full p-0.5 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Container */}
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search modules..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Dropdown List */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Options */}
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredModules.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No modules found
                </div>
              ) : (
                filteredModules.map((module) => {
                  const isSelected = selectedModuleIds.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center justify-between ${
                        isSelected ? "bg-primary-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {module.manufacturer}
                          </span>
                          <span className="text-gray-500">-</span>
                          <span className="text-gray-700 truncate">{module.name}</span>
                        </div>
                        {module.types && module.types.length > 0 && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {module.types.join(', ')}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500">
        {selectedModules.length === 0 
          ? "No modules selected" 
          : `${selectedModules.length} module${selectedModules.length > 1 ? "s" : ""} selected`}
      </p>
    </div>
  );
}

