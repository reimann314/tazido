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

    const data = new TextEncoder().encode("tazid2026" + "::tazid-admin::v1");
    const buf = await crypto.subtle.digest("SHA-256", data);
    const passwordHash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await ctx.db.insert("admins", {
      username: "admin",
      passwordHash,
      displayName: "مدير النظام",
    });
  },
});
