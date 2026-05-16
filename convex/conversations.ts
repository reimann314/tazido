import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);

    const conversations = await ctx.db.query("conversations").collect();
    const mine = conversations.filter((c) => c.participants.includes(user._id));

    return await Promise.all(
      mine.sort((a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt))
        .map(async (c) => {
          const otherId = c.participants.find((p) => p !== user._id);
          const other = otherId ? await ctx.db.get(otherId) : null;
          return {
            _id: c._id,
            otherName: other?.role === "company" ? other.companyName : other?.name,
            otherRole: other?.role,
            otherId,
            jobId: c.jobId,
            lastMessageAt: c.lastMessageAt,
            lastMessageBody: c.lastMessageBody,
            lastMessageSender: c.lastMessageSender,
            unread: false,
          };
        }),
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    otherId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, { token, otherId, jobId, applicationId }) => {
    const user = await getUserFromToken(ctx, token);

    const existing = await ctx.db.query("conversations").collect();
    const found = existing.find(
      (c) => c.participants.includes(user._id) && c.participants.includes(otherId),
    );
    if (found) return found._id;

    return await ctx.db.insert("conversations", {
      participants: [user._id, otherId],
      jobId,
      applicationId,
      createdAt: Date.now(),
    });
  },
});

export const getOrCreate = mutation({
  args: {
    token: v.string(),
    otherId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx, { token, otherId, jobId, applicationId }) => {
    const user = await getUserFromToken(ctx, token);

    const existing = await ctx.db.query("conversations").collect();
    const found = existing.find(
      (c) => c.participants.includes(user._id) && c.participants.includes(otherId),
    );
    if (found) return found._id;

    return await ctx.db.insert("conversations", {
      participants: [user._id, otherId],
      jobId,
      applicationId,
      createdAt: Date.now(),
    });
  },
});
