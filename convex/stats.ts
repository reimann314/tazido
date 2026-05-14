import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type StatsData = {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  verifiedUsers: number;
  verifiedCompanies: number;
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  pendingApplications: number;
};

const defaultStats: StatsData = {
  totalUsers: 0,
  totalStudents: 0,
  totalCompanies: 0,
  verifiedUsers: 0,
  verifiedCompanies: 0,
  totalJobs: 0,
  openJobs: 0,
  totalApplications: 0,
  pendingApplications: 0,
};

async function ensureStatsDoc(
  ctx: MutationCtx,
): Promise<Id<"stats">> {
  const existing = await ctx.db.query("stats").collect();
  if (existing.length === 0) {
    return await ctx.db.insert("stats", defaultStats);
  }
  return existing[0]._id;
}

async function getStatsData(
  ctx: MutationCtx,
  statsId: Id<"stats">,
): Promise<StatsData | null> {
  const doc = await ctx.db.get(statsId);
  if (!doc) return null;
  return doc as unknown as StatsData;
}

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stats").collect();
    if (existing.length > 0) return existing[0]._id;
    return await ctx.db.insert("stats", defaultStats);
  },
});

export const _ensureStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ensureStatsDoc(ctx);
  },
});

export const _updateUserCounter = internalMutation({
  args: {
    op: v.union(v.literal("increment"), v.literal("decrement")),
    role: v.union(v.literal("student"), v.literal("company")),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, { op, role, verified }) => {
    const statsId = await ensureStatsDoc(ctx);
    const delta = op === "increment" ? 1 : -1;
    const current = await getStatsData(ctx, statsId);
    if (!current) return;
    await ctx.db.patch(statsId, {
      totalUsers: current.totalUsers + delta,
      totalStudents:
        role === "student"
          ? current.totalStudents + delta
          : current.totalStudents,
      totalCompanies:
        role === "company"
          ? current.totalCompanies + delta
          : current.totalCompanies,
      verifiedUsers:
        verified
          ? current.verifiedUsers + delta
          : current.verifiedUsers,
      verifiedCompanies:
        role === "company" && verified
          ? current.verifiedCompanies + delta
          : current.verifiedCompanies,
    });
  },
});

export const _updateJobCounter = internalMutation({
  args: {
    op: v.union(v.literal("increment"), v.literal("decrement")),
    open: v.optional(v.boolean()),
  },
  handler: async (ctx, { op, open }) => {
    const statsId = await ensureStatsDoc(ctx);
    const delta = op === "increment" ? 1 : -1;
    const current = await getStatsData(ctx, statsId);
    if (!current) return;
    await ctx.db.patch(statsId, {
      totalJobs: current.totalJobs + delta,
      openJobs: open
        ? current.openJobs + delta
        : current.openJobs,
    });
  },
});

export const _updateApplicationCounter = internalMutation({
  args: {
    op: v.union(v.literal("increment"), v.literal("decrement")),
    pending: v.optional(v.boolean()),
  },
  handler: async (ctx, { op, pending }) => {
    const statsId = await ensureStatsDoc(ctx);
    const delta = op === "increment" ? 1 : -1;
    const current = await getStatsData(ctx, statsId);
    if (!current) return;
    await ctx.db.patch(statsId, {
      totalApplications: current.totalApplications + delta,
      pendingApplications: pending
        ? current.pendingApplications + delta
        : current.pendingApplications,
    });
  },
});

export const _updateVerifiedCounter = internalMutation({
  args: {
    userId: v.id("users"),
    verified: v.boolean(),
  },
  handler: async (ctx, { userId, verified }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "company") return;
    const statsId = await ensureStatsDoc(ctx);
    const current = await getStatsData(ctx, statsId);
    if (!current) return;
    const delta = verified ? 1 : -1;
    await ctx.db.patch(statsId, {
      verifiedUsers: current.verifiedUsers + delta,
      verifiedCompanies: current.verifiedCompanies + delta,
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("stats").collect();
    return (all[0] ?? defaultStats) as StatsData;
  },
});
