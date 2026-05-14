import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const runSeed = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.seed.seedAdmin);
  },
});

import { internalMutation } from "./_generated/server";

export const seedAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", "admin"))
      .unique();
    if (existing) return;

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("tazid2026"),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const hash = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      keyMaterial,
      512,
    );
    const passwordHash = `$pbkdf2-sha256$100000$${
      btoa(String.fromCharCode(...salt))
    }$${
      btoa(String.fromCharCode(...new Uint8Array(hash)))
    }`;

    await ctx.db.insert("admins", {
      username: "admin",
      passwordHash,
      displayName: "مدير النظام",
    });
  },
});
