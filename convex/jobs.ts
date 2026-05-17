/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { getUserFromToken, requireRole, getEffectiveCompanyId } from "./sessionHelpers";

const jobTypeValidator = v.union(
  v.literal("internship"),
  v.literal("full-time"),
  v.literal("part-time"),
);

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const result = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      result.page.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, companyName: company?.companyName ?? "شركة", companyVerified: company?.verified === true };
      }),
    );
    return { ...result, page };
  },
});

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, { id }) => {
    const job = await ctx.db.get(id);
    if (!job) return null;
    const company = await ctx.db.get(job.companyId);
    return { ...job, companyName: company?.companyName ?? "شركة", companyVerified: company?.verified === true };
  },
});

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .order("desc")
      .collect();

    return await Promise.all(
      jobs.map(async (job) => {
        const apps = await ctx.db
          .query("applications")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect();
        return { ...job, applicantCount: apps.length };
      }),
    );
  },
});

function isProfileComplete(user: any): boolean {
  return !!(user.companyName && user.commercialRegistration && user.contactNumber && user.activities);
}

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    type: jobTypeValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, args.token, "company");
    const companyId = getEffectiveCompanyId(user);
    if (!args.title.trim()) throw new Error("العنوان مطلوب");
    if (!args.description.trim()) throw new Error("الوصف مطلوب");

    // Get full user record to check profile completeness
    const fullUser = await ctx.db.get(companyId);
    const profileComplete = fullUser ? isProfileComplete(fullUser) : false;

    const status = profileComplete ? "open" : "pending_approval";

    const jobId = await ctx.db.insert("jobs", {
      companyId,
      title: args.title.trim(),
      description: args.description.trim(),
      location: args.location.trim(),
      type: args.type,
      status,
      createdAt: Date.now(),
    });

    await ctx.runMutation(internal.stats._updateJobCounter, {
      op: "increment",
      open: status === "open",
    });

    await ctx.runMutation(internal.audit._log, {
      userId: user._id, action: "create_opportunity", resourceType: "job", resourceId: jobId,
      details: `العنوان: ${args.title.trim()}, الحالة: ${status}`,
    });

    return { jobId, status, message: profileComplete
      ? "تم نشر الفرصة بنجاح!"
      : "تم إرسال الفرصة للمراجعة. سيتم نشرها بعد موافقة الإدارة." };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    jobId: v.id("jobs"),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    type: jobTypeValidator,
  },
  handler: async (ctx, { token, jobId, title, description, location, type }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const job = await ctx.db.get(jobId);
    if (!job || job.companyId !== companyId) throw new Error("غير مصرّح");
    await ctx.db.patch(jobId, { title: title.trim(), description: description.trim(), location: location.trim(), type });
  },
});

export const setStatus = mutation({
  args: {
    token: v.string(),
    jobId: v.id("jobs"),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("pending_approval")),
  },
  handler: async (ctx, { token, jobId, status }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("الوظيفة غير موجودة");
    if (job.companyId !== companyId) throw new Error("غير مصرّح");
    const wasOpen = job.status === "open";
    const nowOpen = status === "open";
    await ctx.db.patch(jobId, { status });
    if (wasOpen !== nowOpen) {
      await ctx.runMutation(internal.stats._updateJobCounter, {
        op: nowOpen ? "increment" : "decrement",
        open: true,
      });
    }
  },
});

export const listSuggested = query({
  args: { token: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { token, limit }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "student") return [];
    const take = limit ?? 50;

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(take);

    const studentSpec = (user.specialization || "").toLowerCase();
    const studentSkills = (user.skills || "").split(/[،,]/).map((s) => s.trim().toLowerCase()).filter(Boolean);

    const scored = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        const title = job.title.toLowerCase();
        const desc = job.description.toLowerCase();
        let score = 0;
        if (studentSpec && (title.includes(studentSpec) || desc.includes(studentSpec))) {
          score += 3;
        }
        for (const skill of studentSkills) {
          if (title.includes(skill) || desc.includes(skill)) score += 1;
        }
        return {
          ...job,
          companyName: company?.companyName ?? "شركة",
          companyVerified: company?.verified === true,
          matchScore: score,
        };
      }),
    );

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  },
});

// Used by student dashboard to know which jobs they already applied to.
export const myApplicationJobIds = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "student") return [];
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .collect();
    return apps.map((a) => a.jobId);
  },
});
