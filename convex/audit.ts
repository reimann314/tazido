import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getEffectiveCompanyId } from "./sessionHelpers";

export const _log = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, { userId, action, resourceType, resourceId, details }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;
    const companyId = user.role === "company" ? getEffectiveCompanyId(user) : userId;
    await ctx.db.insert("auditLogs", {
      companyId,
      userId,
      action,
      resourceType,
      resourceId,
      details,
      createdAt: Date.now(),
    });
  },
});

export const listByCompany = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const { getUserFromToken } = await import("./sessionHelpers");
    const user = await getUserFromToken(ctx, token);
    const companyId = user.role === "company" ? getEffectiveCompanyId(user) : user._id;
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .order("desc")
      .take(100);
  },
});
