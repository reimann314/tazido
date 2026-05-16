import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const items = await ctx.db
      .query("programs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (p) => {
        const student = await ctx.db.get(p.studentId);
        return { ...p, studentName: student?.name ?? "—" };
      }),
    );
  },
});

export const listByStudent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "student");
    const items = await ctx.db
      .query("programs")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (p) => {
        const company = await ctx.db.get(p.companyId);
        return { ...p, companyName: company?.companyName ?? "—" };
      }),
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    studentId: v.id("users"),
    title: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    supervisorName: v.optional(v.string()),
    notes: v.optional(v.string()),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, { token, studentId, title, startDate, endDate, supervisorName, notes, jobId, applicationId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    if (!title.trim()) throw new Error("العنوان مطلوب");
    if (!startDate.trim()) throw new Error("تاريخ البداية مطلوب");

    return await ctx.db.insert("programs", {
      companyId,
      studentId,
      jobId,
      applicationId,
      title: title.trim(),
      startDate: startDate.trim(),
      endDate: endDate?.trim(),
      supervisorName: supervisorName?.trim(),
      status: "active",
      notes: notes?.trim(),
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, { token, programId, status }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const program = await ctx.db.get(programId);
    if (!program || program.companyId !== companyId) throw new Error("غير مصرّح");
    await ctx.db.patch(programId, { status });
  },
});
