import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";

export const updateStudentProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    academicLevel: v.optional(v.string()),
    specialization: v.optional(v.string()),
    skills: v.optional(v.string()),
    languages: v.optional(v.string()),
    hobbies: v.optional(v.string()),
    experiences: v.optional(v.string()),
    entityType: v.optional(v.string()),
    entityName: v.optional(v.string()),
    university: v.optional(v.string()),
  },
  handler: async (ctx, { token, ...updates }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "student") throw new Error("غير مصرّح");
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) cleaned[key] = val;
    }
    if (Object.keys(cleaned).length > 0) {
      await ctx.db.patch(user._id, cleaned);
    }
    return true;
  },
});

export const updateCompanyProfile = mutation({
  args: {
    token: v.string(),
    companyName: v.optional(v.string()),
    website: v.optional(v.string()),
    commercialRegistration: v.optional(v.string()),
    activities: v.optional(v.string()),
    crValidityDate: v.optional(v.string()),
    companyAge: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, ...updates } = args;
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "company") throw new Error("غير مصرّح");
    const patched: Record<string, string> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val) patched[key] = val;
    }
    if (Object.keys(patched).length > 0) {
      await ctx.db.patch(user._id, patched);
    }
    return true;
  },
});
