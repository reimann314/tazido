import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireRole } from "./sessionHelpers";

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("reviewed"),
  v.literal("accepted"),
  v.literal("rejected"),
);

export const apply = mutation({
  args: { token: v.string(), jobId: v.id("jobs") },
  handler: async (ctx, { token, jobId }) => {
    const user = await requireRole(ctx, token, "student");
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("الوظيفة غير موجودة");
    if (job.status !== "open") throw new Error("التقديم مغلق على هذه الوظيفة");

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_student_and_job", (q) =>
        q.eq("studentId", user._id).eq("jobId", jobId),
      )
      .unique();
    if (existing) throw new Error("لقد قدّمت على هذه الوظيفة من قبل");

    const appId = await ctx.db.insert("applications", {
      jobId,
      studentId: user._id,
      status: "pending",
      appliedAt: Date.now(),
    });

    await ctx.runMutation(internal.notifications._create, {
      userId: job.companyId,
      type: "new_application",
      title: "تقديم جديد على وظيفة",
      body: "قدّم " + (user.name ?? "طالب") + " على وظيفة " + job.title,
    });

    return appId;
  },
});

export const listByStudent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "student");
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      apps.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        const company = job ? await ctx.db.get(job.companyId) : null;
        return {
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          jobId: app.jobId,
          jobTitle: job?.title ?? "—",
          companyName: company?.companyName ?? "—",
        };
      }),
    );
  },
});

export const listByJob = query({
  args: { token: v.string(), jobId: v.id("jobs") },
  handler: async (ctx, { token, jobId }) => {
    const user = await requireRole(ctx, token, "company");
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("الوظيفة غير موجودة");
    if (job.companyId !== user._id) throw new Error("غير مصرّح");

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .order("desc")
      .collect();

    return await Promise.all(
      apps.map(async (app) => {
        const student = await ctx.db.get(app.studentId);
        return {
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          studentName: student?.name ?? "—",
          studentEmail: student?.email ?? "",
          university: student?.university ?? "",
        };
      }),
    );
  },
});

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", user._id))
      .collect();
    const allApps = [];
    for (const job of jobs) {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_job", (q) => q.eq("jobId", job._id))
        .collect();
      for (const app of apps) {
        const student = await ctx.db.get(app.studentId);
        allApps.push({
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          jobId: app.jobId,
          jobTitle: job.title,
          studentName: student?.name ?? "—",
          studentEmail: student?.email ?? "",
        });
      }
    }
    return allApps.sort((a, b) => b.appliedAt - a.appliedAt);
  },
});

export const setStatus = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("applications"),
    status: statusValidator,
  },
  handler: async (ctx, { token, applicationId, status }) => {
    const user = await requireRole(ctx, token, "company");
    const app = await ctx.db.get(applicationId);
    if (!app) throw new Error("الطلب غير موجود");
    const job = await ctx.db.get(app.jobId);
    if (!job || job.companyId !== user._id) throw new Error("غير مصرّح");
    await ctx.db.patch(applicationId, { status });

    const labels: Record<string, string> = {
      reviewed: "تمت مراجعة طلبك",
      accepted: "تهانينا! تم قبول طلبك",
      rejected: "نأسف، لم يتم قبول طلبك",
    };
    const bodies: Record<string, string> = {
      reviewed: "قامت الشركة بمراجعة طلبك على وظيفة " + (job?.title ?? ""),
      accepted: "تم قبول طلبك على وظيفة " + (job?.title ?? ""),
      rejected: "لم يتم قبول طلبك على وظيفة " + (job?.title ?? ""),
    };
    if (labels[status] && bodies[status]) {
      await ctx.runMutation(internal.notifications._create, {
        userId: app.studentId,
        type: "application_status",
        title: labels[status],
        body: bodies[status],
      });
    }
  },
});
