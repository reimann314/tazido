import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./sessionHelpers";

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const items = await ctx.db
      .query("shortlists")
      .withIndex("by_company", (q) => q.eq("companyId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (item) => {
        const student = await ctx.db.get(item.studentId);
        let cvUrl: string | null = null;
        if (student?.cvStorageId) {
          cvUrl = await ctx.storage.getUrl(student.cvStorageId);
        }
        return {
          _id: item._id,
          studentId: item.studentId,
          note: item.note,
          createdAt: item.createdAt,
          studentName: student?.name ?? "—",
          studentEmail: student?.email ?? "",
          specialization: student?.specialization ?? "",
          university: student?.university ?? "",
          academicLevel: student?.academicLevel ?? "",
          skills: student?.skills ?? "",
          cvUrl,
        };
      }),
    );
  },
});

export const add = mutation({
  args: { token: v.string(), studentId: v.id("users"), note: v.optional(v.string()) },
  handler: async (ctx, { token, studentId, note }) => {
    const user = await requireRole(ctx, token, "company");

    const existing = await ctx.db
      .query("shortlists")
      .withIndex("by_company_and_student", (q) =>
        q.eq("companyId", user._id).eq("studentId", studentId),
      )
      .unique();
    if (existing) throw new Error("الطالب موجود بالفعل في القائمة المختصرة");

    return await ctx.db.insert("shortlists", {
      companyId: user._id,
      studentId,
      note,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { token: v.string(), shortlistId: v.id("shortlists") },
  handler: async (ctx, { token, shortlistId }) => {
    const user = await requireRole(ctx, token, "company");
    const item = await ctx.db.get(shortlistId);
    if (!item || item.companyId !== user._id) throw new Error("غير مصرّح");
    await ctx.db.delete(shortlistId);
  },
});

export const isShortlisted = query({
  args: { token: v.string(), studentId: v.id("users") },
  handler: async (ctx, { token, studentId }) => {
    const user = await requireRole(ctx, token, "company");
    const item = await ctx.db
      .query("shortlists")
      .withIndex("by_company_and_student", (q) =>
        q.eq("companyId", user._id).eq("studentId", studentId),
      )
      .unique();
    return item !== null;
  },
});
