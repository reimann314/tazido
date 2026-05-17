import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserFromToken, requireRole, getEffectiveCompanyId } from "./sessionHelpers";

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

    await ctx.runMutation(internal.stats._updateApplicationCounter, {
      op: "increment",
      pending: true,
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
    const companyId = getEffectiveCompanyId(user);
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("الوظيفة غير موجودة");
    if (job.companyId !== companyId) throw new Error("غير مصرّح");

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .order("desc")
      .collect();

    return await Promise.all(
      apps.map(async (app) => {
        const student = await ctx.db.get(app.studentId);
        let cvUrl: string | null = null;
        if (student?.cvStorageId) {
          cvUrl = await ctx.storage.getUrl(student.cvStorageId);
        }
        return {
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          studentName: student?.name ?? "—",
          studentEmail: student?.email ?? "",
          university: student?.university ?? "",
          cvUrl,
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
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .collect();
    const allApps = [];
    for (const job of jobs) {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_job", (q) => q.eq("jobId", job._id))
        .collect();
      for (const app of apps) {
        const student = await ctx.db.get(app.studentId);
        let cvUrl: string | null = null;
        if (student?.cvStorageId) {
          cvUrl = await ctx.storage.getUrl(student.cvStorageId);
        }
        allApps.push({
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          jobId: app.jobId,
          jobTitle: job.title,
          studentName: student?.name ?? "—",
          studentEmail: student?.email ?? "",
          studentId: student?._id,
          cvUrl,
        });
      }
    }
    return allApps.sort((a, b) => b.appliedAt - a.appliedAt);
  },
});

export const withdraw = mutation({
  args: { token: v.string(), applicationId: v.id("applications") },
  handler: async (ctx, { token, applicationId }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "student") throw new Error("غير مصرّح");
    const app = await ctx.db.get(applicationId);
    if (!app || app.studentId !== user._id) throw new Error("غير مصرّح");
    if (app.status !== "pending") throw new Error("لا يمكن إلغاء طلب تمت مراجعته");
    await ctx.db.delete(applicationId);

    const job = await ctx.db.get(app.jobId);
    if (job && job.companyId) {
      await ctx.runMutation(internal.notifications._create, {
        userId: job.companyId,
        type: "application_withdrawn",
        title: "تم إلغاء تقديم",
        body: "قام الطالب بإلغاء تقديمه على وظيفة " + job.title,
      });
    }
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
    const companyId = getEffectiveCompanyId(user);
    const app = await ctx.db.get(applicationId);
    if (!app) throw new Error("الطلب غير موجود");
    const job = await ctx.db.get(app.jobId);
    if (!job || job.companyId !== companyId) throw new Error("غير مصرّح");
    const wasPending = app.status === "pending";
    const nowPending = status === "pending";
    await ctx.db.patch(applicationId, { status });
    if (wasPending !== nowPending) {
      await ctx.runMutation(internal.stats._updateApplicationCounter, {
        op: nowPending ? "increment" : "decrement",
        pending: true,
      });
    }

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

    // Send email notification
    if (status === "accepted" || status === "rejected") {
      const student = await ctx.db.get(app.studentId);
      const company = await ctx.db.get(user._id);
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM ?? "Tazid <onboarding@resend.dev>";
      if (apiKey && student?.email && company?.companyName) {
        const subject = status === "accepted" ? "تهانينا! تم قبول طلبك" : "تحديث حالة طلبك";
        const message = status === "accepted"
          ? `تهانينا! تم قبول طلبك على وظيفة "${job.title}" في شركة ${company.companyName}. سنتواصل معك قريباً بخصوص الخطوات التالية.`
          : `نأسف، لم يتم قبول طلبك على وظيفة "${job.title}" في شركة ${company.companyName}. نتمنى لك التوفيق في فرص أخرى.`;
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              to: student.email,
              subject: subject + " – تزيد",
              html: `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;"><table align="center" style="max-width:600px;width:100%;background:white;border-radius:16px;"><tr><td style="background:linear-gradient(135deg,#1a3a3a,#2d6a5e);padding:30px;text-align:center;"><h1 style="color:white;margin:0;font-size:28px;">${subject}</h1></td></tr><tr><td style="padding:30px;"><p style="font-size:18px;color:#333;">مرحباً ${student.name || "عزيزي المستخدم"}،</p><p style="font-size:15px;color:#666;line-height:1.8;">${message}</p><hr style="border:none;border-top:1px solid #eee;margin:20px 0;"><p style="font-size:13px;color:#999;text-align:center;">© 2026 تزيد | جميع الحقوق محفوظة</p></td></tr></table></body></html>`,
            }),
          });
        } catch { console.debug("email send failed"); }
      }
    }
  },
});
