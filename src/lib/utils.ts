import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export const PLANS = {
  FREE: {
    name: "Free",
    maxSpaces: 1,
    maxTestimonials: 10,
    removeBranding: false,
    price: 0,
  },
  PRO: {
    name: "Pro",
    maxSpaces: 3,
    maxTestimonials: Infinity,
    removeBranding: true,
    price: 29,
  },
} as const;
