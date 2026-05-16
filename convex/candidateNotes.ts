import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const listByApplication = query({
  args: { token: v.string(), applicationId: v.id("applications") },
  handler: async (ctx, { token, applicationId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);

    const notes = await ctx.db
      .query("candidateNotes")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .collect();

    const filtered = notes.filter((n) => n.companyId === companyId);

    return await Promise.all(
      filtered.map(async (n) => {
        const author = await ctx.db.get(n.authorId);
        return {
          _id: n._id,
          note: n.note,
          createdAt: n.createdAt,
          authorName: author?.name ?? "—",
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    studentId: v.id("users"),
    note: v.string(),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, { token, studentId, note, applicationId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);

    if (!note.trim()) throw new Error("الملاحظة فارغة");

    return await ctx.db.insert("candidateNotes", {
      companyId,
      studentId,
      applicationId,
      authorId: user._id,
      note: note.trim(),
      createdAt: Date.now(),
    });
  },
});
