import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeImageSrc(src?: string | null): string {
  if (!src) return '';

  // If the source is a remote URL that already contains query parameters (e.g., Unsplash
  // with `?w=800&h=600...`), strip the query string. Next's image optimizer will provide
  // its own resizing parameters; leaving the original query causes `url` parameter
  // parsing issues and 400 responses.
  if (/^https?:\/\//.test(src)) {
    const idx = src.indexOf('?');
    return idx === -1 ? src : src.slice(0, idx);
  }

  return src;
}
