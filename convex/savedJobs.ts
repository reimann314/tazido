import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    const items = await ctx.db
      .query("savedJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (item) => {
        const job = await ctx.db.get(item.jobId);
        if (!job) return null;
        const company = await ctx.db.get(job.companyId);
        return {
          ...job,
          companyName: company?.companyName ?? "شركة",
          companyVerified: company?.verified === true,
          savedAt: item.createdAt,
        };
      }),
    ).then((r) => r.filter(Boolean));
  },
});

export const add = mutation({
  args: { token: v.string(), jobId: v.id("jobs") },
  handler: async (ctx, { token, jobId }) => {
    const user = await getUserFromToken(ctx, token);
    const existing = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) => q.eq("userId", user._id).eq("jobId", jobId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("savedJobs", { userId: user._id, jobId, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { token: v.string(), jobId: v.id("jobs") },
  handler: async (ctx, { token, jobId }) => {
    const user = await getUserFromToken(ctx, token);
    const item = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) => q.eq("userId", user._id).eq("jobId", jobId))
      .unique();
    if (item) await ctx.db.delete(item._id);
  },
});

export const isSaved = query({
  args: { token: v.string(), jobId: v.id("jobs") },
  handler: async (ctx, { token, jobId }) => {
    const user = await getUserFromToken(ctx, token);
    const item = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_and_job", (q) => q.eq("userId", user._id).eq("jobId", jobId))
      .unique();
    return item !== null;
  },
});
