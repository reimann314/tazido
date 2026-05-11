import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export async function getUserFromToken(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<Doc<"users">> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("الجلسة غير صالحة، يرجى تسجيل الدخول");
  }
  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error("المستخدم غير موجود");
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  token: string,
  role: "student" | "company",
): Promise<Doc<"users">> {
  const user = await getUserFromToken(ctx, token);
  if (user.role !== role) {
    throw new Error("هذه العملية غير متاحة لحسابك");
  }
  return user;
}
