"use client";

import { SignIn } from "@clerk/nextjs";

/** Rendered only when a real Clerk publishable key is configured. */
export function ClerkSignIn() {
  return (
    <SignIn
      routing="hash"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none border border-border-default bg-surface",
        },
      }}
    />
  );
}
