import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getEffectiveCompanyId } from "./sessionHelpers";

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);

    const members = await ctx.db
      .query("companyMembers")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .collect();

    return await Promise.all(
      members.map(async (m) => {
        const memberUser = await ctx.db.get(m.userId);
        return {
          _id: m._id,
          userId: m.userId,
          role: m.role,
          addedBy: m.addedBy,
          createdAt: m.createdAt,
          name: memberUser?.name ?? "—",
          email: memberUser?.email ?? "",
        };
      }),
    );
  },
});

export const add = mutation({
  args: {
    token: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("hr"), v.literal("hiring_manager")),
  },
  handler: async (ctx, { token, email, role }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .unique();
    if (!targetUser) throw new Error("لا يوجد مستخدم بهذا البريد الإلكتروني");
    if (targetUser.role !== "company") throw new Error("يمكن إضافة حسابات الشركات فقط");

    const already = await ctx.db
      .query("companyMembers")
      .withIndex("by_user", (q) => q.eq("userId", targetUser._id))
      .unique();
    if (already) throw new Error("هذا المستخدم عضو بالفعل في شركة");

    await ctx.db.patch(targetUser._id, { parentCompanyId: companyId });

    return await ctx.db.insert("companyMembers", {
      companyId,
      userId: targetUser._id,
      role,
      addedBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, { token, userId }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);

    const member = await ctx.db
      .query("companyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!member || member.companyId !== companyId) throw new Error("غير مصرّح");

    await ctx.db.patch(userId, { parentCompanyId: undefined });
    await ctx.db.delete(member._id);
  },
});

export const updateRole = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("hr"), v.literal("hiring_manager")),
  },
  handler: async (ctx, { token, userId, role }) => {
    const user = await requireRole(ctx, token, "company");
    const companyId = getEffectiveCompanyId(user);

    const member = await ctx.db
      .query("companyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!member || member.companyId !== companyId) throw new Error("غير مصرّح");

    await ctx.db.patch(member._id, { role });
  },
});
