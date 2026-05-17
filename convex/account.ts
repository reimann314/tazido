import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserFromToken } from "./sessionHelpers";

export const exportData = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);

    const jobs = await ctx.db.query("jobs").collect();
    const myJobs = jobs.filter((j) => j.companyId === user._id);

    const apps = await ctx.db.query("applications").collect();
    const myApps = user.role === "student"
      ? apps.filter((a) => a.studentId === user._id)
      : apps.filter((a) => myJobs.some((j) => j._id === a.jobId));

    return {
      profile: user,
      jobs: myJobs,
      applications: myApps,
    };
  },
});

export const deleteAccount = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);

    // Delete sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);

    // Delete saved jobs
    const saved = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of saved) await ctx.db.delete(s._id);

    // Delete applications
    const apps = await ctx.db
      .query("applications")
      .collect();
    const myApps = apps.filter((a) => user.role === "student" ? a.studentId === user._id : false);
    for (const a of myApps) await ctx.db.delete(a._id);
    // If company, also delete jobs + their applications
    if (user.role === "company") {
      const jobs = await ctx.db
        .query("jobs")
        .withIndex("by_company", (q) => q.eq("companyId", user._id))
        .collect();
      for (const job of jobs) {
        const jobApps = apps.filter((a) => a.jobId === job._id);
        for (const a of jobApps) await ctx.db.delete(a._id);
        await ctx.db.delete(job._id);
      }
      // Remove members
      const members = await ctx.db
        .query("companyMembers")
        .withIndex("by_company", (q) => q.eq("companyId", user._id))
        .collect();
      for (const m of members) await ctx.db.delete(m._id);
    }

    // Delete conversations and messages
    const convs = await ctx.db.query("conversations").collect();
    for (const c of convs.filter((c) => c.participants.includes(user._id))) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(c._id);
    }

    // Delete notifications
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const n of notifs) await ctx.db.delete(n._id);

    await ctx.db.delete(user._id);

    await ctx.runMutation(internal.stats._updateUserCounter, {
      op: "decrement",
      role: user.role,
    });
  },
});
