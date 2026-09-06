import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes so a later class always wins over an earlier one. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
