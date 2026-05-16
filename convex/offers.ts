import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const items = await ctx.db
      .query("offers")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (item) => {
        const student = await ctx.db.get(item.studentId);
        return { ...item, studentName: student?.name ?? "—" };
      }),
    );
  },
});

export const listByStudent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "student");
    const items = await ctx.db
      .query("offers")
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
    title: v.string(),
    salary: v.optional(v.string()),
    startDate: v.string(),
    terms: v.string(),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, { token, studentId, title, salary, startDate, terms, jobId, applicationId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    if (!title.trim()) throw new Error("العنوان مطلوب");
    if (!startDate.trim()) throw new Error("تاريخ البداية مطلوب");

    const offerId = await ctx.db.insert("offers", {
      companyId,
      studentId,
      jobId,
      applicationId,
      title: title.trim(),
      salary,
      startDate: startDate.trim(),
      terms: terms.trim(),
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.runMutation(internal.notifications._create, {
      userId: studentId,
      type: "offer_received",
      title: "عرض توظيف جديد",
      body: "قامت الشركة بإرسال عرض توظيف لك.",
    });

    return offerId;
  },
});

export const respond = mutation({
  args: {
    token: v.string(),
    offerId: v.id("offers"),
    accept: v.boolean(),
  },
  handler: async (ctx, { token, offerId, accept }) => {
    const user = await requireRole(ctx, token, "student");
    const offer = await ctx.db.get(offerId);
    if (!offer || offer.studentId !== user._id) throw new Error("غير مصرّح");
    if (offer.status !== "pending") throw new Error("تم الرد على هذا العرض مسبقاً");

    await ctx.db.patch(offerId, {
      status: accept ? "accepted" : "rejected",
      respondedAt: Date.now(),
    });

    await ctx.runMutation(internal.notifications._create, {
      userId: offer.companyId,
      type: "offer_response",
      title: accept ? "تم قبول العرض" : "تم رفض العرض",
      body: accept ? "قام الطالب بقبول عرض التوظيف." : "قام الطالب برفض عرض التوظيف.",
    });
  },
});

export const withdraw = mutation({
  args: { token: v.string(), offerId: v.id("offers") },
  handler: async (ctx, { token, offerId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const offer = await ctx.db.get(offerId);
    if (!offer || offer.companyId !== companyId) throw new Error("غير مصرّح");
    await ctx.db.patch(offerId, { status: "withdrawn" });
  },
});
