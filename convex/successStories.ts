import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    const stories = await ctx.db
      .query("successStories")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .take(10);

    return await Promise.all(
      stories.map(async (s) => {
        const company = await ctx.db.get(s.companyId);
        const student = await ctx.db.get(s.studentId);
        return {
          ...s,
          companyName: company?.companyName ?? "—",
          studentName: student?.name ?? "—",
        };
      }),
    );
  },
});

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const stories = await ctx.db
      .query("successStories")
      .collect();
    const mine = stories.filter((s) => s.companyId === companyId);

    return await Promise.all(
      mine.map(async (s) => {
        const student = await ctx.db.get(s.studentId);
        return { ...s, studentName: student?.name ?? "—" };
      }),
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    story: v.string(),
    studentQuote: v.optional(v.string()),
  },
  handler: async (ctx, { token, programId, story, studentQuote }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const program = await ctx.db.get(programId);
    if (!program || program.companyId !== companyId) throw new Error("غير مصرّح");
    if (!story.trim()) throw new Error("القصة مطلوبة");

    return await ctx.db.insert("successStories", {
      companyId,
      studentId: program.studentId,
      programId,
      story: story.trim(),
      studentQuote: studentQuote?.trim(),
      approved: false,
      createdAt: Date.now(),
    });
  },
});
