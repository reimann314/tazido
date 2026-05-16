import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const getByProgram = query({
  args: { token: v.string(), programId: v.id("programs") },
  handler: async (ctx, { token, programId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const program = await ctx.db.get(programId);
    if (!program || program.companyId !== companyId) throw new Error("غير مصرّح");

    return await ctx.db
      .query("evaluations")
      .withIndex("by_program", (q) => q.eq("programId", programId))
      .collect();
  },
});

export const listByStudent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "student");
    const programs = await ctx.db
      .query("programs")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .collect();
    const all = [];
    for (const p of programs) {
      const evals = await ctx.db
        .query("evaluations")
        .withIndex("by_program", (q) => q.eq("programId", p._id))
        .collect();
      all.push(...evals);
    }
    return all;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    type: v.union(v.literal("company_to_student"), v.literal("student_to_company")),
    rating: v.number(),
    skills: v.optional(v.number()),
    attendance: v.optional(v.number()),
    communication: v.optional(v.number()),
    feedback: v.string(),
  },
  handler: async (ctx, { token, programId, type, rating, skills, attendance, communication, feedback }) => {
    const program = await ctx.db.get(programId);
    if (!program) throw new Error("البرنامج غير موجود");
    if (rating < 1 || rating > 5) throw new Error("التقييم يجب أن يكون بين 1 و 5");

    if (type === "company_to_student") {
      const user = await requireRole(ctx, token, "company");
      const companyId = getEffectiveCompanyId(user);
      if (program.companyId !== companyId) throw new Error("غير مصرّح");
    } else {
      const user = await requireRole(ctx, token, "student");
      if (program.studentId !== user._id) throw new Error("غير مصرّح");
    }

    const reviewerId = type === "company_to_student"
      ? (await requireRole(ctx, token, "company"))._id
      : (await requireRole(ctx, token, "student"))._id;

    return await ctx.db.insert("evaluations", {
      programId,
      reviewerId,
      type,
      rating,
      skills,
      attendance,
      communication,
      feedback: feedback.trim(),
      createdAt: Date.now(),
    });
  },
});
