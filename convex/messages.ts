import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";

export const list = query({
  args: { token: v.string(), conversationId: v.id("conversations") },
  handler: async (ctx, { token, conversationId }) => {
    const user = await getUserFromToken(ctx, token);

    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.participants.includes(user._id)) {
      throw new Error("غير مصرّح");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .order("desc")
      .take(100);
  },
});

export const send = mutation({
  args: {
    token: v.string(),
    conversationId: v.id("conversations"),
    body: v.string(),
  },
  handler: async (ctx, { token, conversationId, body }) => {
    const user = await getUserFromToken(ctx, token);

    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.participants.includes(user._id)) {
      throw new Error("غير مصرّح");
    }

    if (!body.trim()) throw new Error("الرسالة فارغة");

    await ctx.db.insert("messages", {
      conversationId,
      senderId: user._id,
      body: body.trim(),
      createdAt: Date.now(),
    });

    await ctx.db.patch(conversationId, {
      lastMessageAt: Date.now(),
      lastMessageBody: body.trim().slice(0, 100),
      lastMessageSender: user._id,
    });
  },
});

export const markRead = mutation({
  args: { token: v.string(), conversationId: v.id("conversations") },
  handler: async (ctx, { token, conversationId }) => {
    const user = await getUserFromToken(ctx, token);
    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !conversation.participants.includes(user._id)) return;
  },
});
