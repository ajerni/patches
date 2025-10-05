import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractHearthisId(url: string): string | null {
  // Extract ID from URLs like: https://hearthis.at/ernilab/patch1/
  const match = url.match(/hearthis\.at\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return null;
}

