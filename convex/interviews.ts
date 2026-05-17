import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserFromToken, requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const items = await ctx.db
      .query("interviews")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
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
    slot2: v.optional(v.number()),
    slot3: v.optional(v.number()),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { token, studentId, slot1, slot2, slot3, jobId, applicationId, notes }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const slots = [slot1];
    if (slot2) slots.push(slot2);
    if (slot3) slots.push(slot3);

    const interviewId = await ctx.db.insert("interviews", {
      companyId,
      studentId,
      jobId,
      applicationId,
      proposedSlots: slots,
      status: "pending",
      notes,
      createdAt: Date.now(),
    });

    await ctx.runMutation(internal.notifications._create, {
      userId: studentId,
      type: "interview_scheduled",
      title: "موعد مقابلة جديد",
      body: "قامت الشركة بتحديد موعد مقابلة. يرجى اختيار الوقت المناسب.",
    });

    return interviewId;
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

    await ctx.runMutation(internal.notifications._create, {
      userId: interview.companyId,
      type: "interview_confirmed",
      title: "تم تأكيد المقابلة",
      body: "قام الطالب بتأكيد الموعد المقترح للمقابلة.",
    });
  },
});

export const setMeeting = mutation({
  args: {
    token: v.string(),
    interviewId: v.id("interviews"),
    meetingLink: v.string(),
    meetingInfo: v.optional(v.string()),
  },
  handler: async (ctx, { token, interviewId, meetingLink, meetingInfo }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const interview = await ctx.db.get(interviewId);
    if (!interview || interview.companyId !== companyId) throw new Error("غير مصرّح");
    if (interview.status !== "confirmed") throw new Error("المقابلة غير مؤكدة بعد");

    await ctx.db.patch(interviewId, { meetingLink, meetingInfo: meetingInfo?.trim() });

    await ctx.runMutation(internal.notifications._create, {
      userId: interview.studentId,
      type: "interview_meeting",
      title: "تم تحديد رابط المقابلة",
      body: "قامت الشركة بإضافة رابط المقابلة. يمكنك الآن الدخول في الموعد المحدد.",
    });
  },
});

export const requestReschedule = mutation({
  args: {
    token: v.string(),
    interviewId: v.id("interviews"),
    slot1: v.number(),
    slot2: v.optional(v.number()),
    slot3: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { token, interviewId, slot1, slot2, slot3, reason }) => {
    const user = await requireRole(ctx, token, "student");
    const interview = await ctx.db.get(interviewId);
    if (!interview || interview.studentId !== user._id) throw new Error("غير مصرّح");
    if (interview.status !== "confirmed") throw new Error("لا يمكن طلب تغيير في هذه الحالة");

    const slots = [slot1];
    if (slot2) slots.push(slot2);
    if (slot3) slots.push(slot3);

    await ctx.db.patch(interviewId, {
      proposedSlots: slots,
      selectedSlot: undefined,
      status: "pending",
      notes: reason ? (interview.notes ? interview.notes + "\n---\nطلب تغيير: " + reason : "طلب تغيير: " + reason) : interview.notes,
    });

    await ctx.runMutation(internal.notifications._create, {
      userId: interview.companyId,
      type: "interview_reschedule",
      title: "طلب تغيير موعد المقابلة",
      body: "طلب الطالب تغيير موعد المقابلة واقترح مواعيد جديدة.",
    });
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

    const otherId = interview.companyId === user._id ? interview.studentId : interview.companyId;
    await ctx.runMutation(internal.notifications._create, {
      userId: otherId,
      type: "interview_cancelled",
      title: "تم إلغاء المقابلة",
      body: "تم إلغاء المقابلة المحددة.",
    });
  },
});
