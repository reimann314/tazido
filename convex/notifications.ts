import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const unreadCount = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", user._id).eq("read", false),
      )
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { token: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, { token, notificationId }) => {
    const user = await getUserFromToken(ctx, token);
    const notif = await ctx.db.get(notificationId);
    if (!notif || notif.userId !== user._id) return;
    await ctx.db.patch(notificationId, { read: true });
  },
});

export const markAllRead = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", user._id).eq("read", false),
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const _create = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { userId, type, title, body }) => {
    await ctx.db.insert("notifications", {
      userId,
      type,
      title,
      body,
      read: false,
      createdAt: Date.now(),
    });
  },
});
