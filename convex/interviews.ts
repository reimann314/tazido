import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserFromToken, requireRole } from "./sessionHelpers";

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const items = await ctx.db
      .query("interviews")
      .withIndex("by_company", (q) => q.eq("companyId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (item) => {
        const student = await ctx.db.get(item.studentId);
        return { ...item, studentName: student?.name ?? "—", studentEmail: student?.email ?? "" };
      }),
    );
  },
});

export const listByStudent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "student");
    const items = await ctx.db
      .query("interviews")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (item) => {
        const company = await ctx.db.get(item.companyId);
        return { ...item, companyName: company?.companyName ?? "—" };
      }),
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    studentId: v.id("users"),
    slot1: v.number(),
    slot2: v.number(),
    slot3: v.optional(v.number()),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { token, studentId, slot1, slot2, slot3, jobId, applicationId, notes }) => {
    const user = await requireRole(ctx, token, "company");
    const slots = [slot1, slot2];
    if (slot3) slots.push(slot3);

    return await ctx.db.insert("interviews", {
      companyId: user._id,
      studentId,
      jobId,
      applicationId,
      proposedSlots: slots,
      status: "pending",
      notes,
      createdAt: Date.now(),
    });
  },
});

export const selectSlot = mutation({
  args: {
    token: v.string(),
    interviewId: v.id("interviews"),
    slot: v.number(),
  },
  handler: async (ctx, { token, interviewId, slot }) => {
    const user = await requireRole(ctx, token, "student");
    const interview = await ctx.db.get(interviewId);
    if (!interview || interview.studentId !== user._id) throw new Error("غير مصرّح");
    if (interview.status !== "pending") throw new Error("تم الرد على هذا الطلب مسبقاً");
    if (!interview.proposedSlots.includes(slot)) throw new Error("الموعد غير صالح");

    await ctx.db.patch(interviewId, { selectedSlot: slot, status: "confirmed" });
  },
});

export const cancel = mutation({
  args: { token: v.string(), interviewId: v.id("interviews") },
  handler: async (ctx, { token, interviewId }) => {
    const user = await getUserFromToken(ctx, token);
    const interview = await ctx.db.get(interviewId);
    if (!interview) throw new Error("غير موجود");
    if (interview.companyId !== user._id && interview.studentId !== user._id) {
      throw new Error("غير مصرّح");
    }
    await ctx.db.patch(interviewId, { status: "cancelled" });
  },
});
