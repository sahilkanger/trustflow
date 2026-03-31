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
    analytics: false,
    aiEnhancement: false,
    emailCampaigns: false,
    price: 0,
  },
  PRO: {
    name: "Pro",
    maxSpaces: 3,
    maxTestimonials: Infinity,
    removeBranding: true,
    analytics: true,
    aiEnhancement: false,
    emailCampaigns: true,
    price: 29,
  },
  BUSINESS: {
    name: "Business",
    maxSpaces: 10,
    maxTestimonials: Infinity,
    removeBranding: true,
    analytics: true,
    aiEnhancement: true,
    emailCampaigns: true,
    price: 79,
  },
  ENTERPRISE: {
    name: "Enterprise",
    maxSpaces: Infinity,
    maxTestimonials: Infinity,
    removeBranding: true,
    analytics: true,
    aiEnhancement: true,
    emailCampaigns: true,
    price: 199,
  },
} as const;
