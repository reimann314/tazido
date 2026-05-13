import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "::tazid::v1");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Internal helpers ----------

export const _getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const _insertUser = internalMutation({
  args: {
    role: v.union(v.literal("student"), v.literal("company")),
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    university: v.optional(v.string()),
    website: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    academicLevel: v.optional(v.string()),
    specialization: v.optional(v.string()),
    skills: v.optional(v.string()),
    languages: v.optional(v.string()),
    hobbies: v.optional(v.string()),
    experiences: v.optional(v.string()),
    entityType: v.optional(v.string()),
    entityName: v.optional(v.string()),
    commercialRegistration: v.optional(v.string()),
    activities: v.optional(v.string()),
    crValidityDate: v.optional(v.string()),
    companyAge: v.optional(v.string()),
    companyProfileFile: v.optional(v.string()),
    crFile: v.optional(v.string()),
    zakatCertificate: v.optional(v.string()),
    taxCertificate: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const _createSession = internalMutation({
  args: { userId: v.id("users"), token: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", args);
  },
});

// ---------- Public actions ----------

export const signUp = action({
  args: {
    role: v.union(v.literal("student"), v.literal("company")),
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    university: v.optional(v.string()),
    website: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    academicLevel: v.optional(v.string()),
    specialization: v.optional(v.string()),
    skills: v.optional(v.string()),
    languages: v.optional(v.string()),
    hobbies: v.optional(v.string()),
    experiences: v.optional(v.string()),
    entityType: v.optional(v.string()),
    entityName: v.optional(v.string()),
    commercialRegistration: v.optional(v.string()),
    activities: v.optional(v.string()),
    crValidityDate: v.optional(v.string()),
    companyAge: v.optional(v.string()),
    companyProfileFile: v.optional(v.string()),
    crFile: v.optional(v.string()),
    zakatCertificate: v.optional(v.string()),
    taxCertificate: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ token: string; userId: Id<"users"> }> => {
    const email = args.email.trim().toLowerCase();
    if (!email.includes("@") || !email.includes(".")) {
      throw new Error("البريد الإلكتروني غير صالح، تأكّد من الصيغة (مثال: name@example.com)");
    }
    if (args.password.length < 6) {
      throw new Error("كلمة المرور قصيرة، يجب أن تحتوي على ٦ أحرف على الأقل");
    }

    const existing = await ctx.runQuery(internal.auth._getUserByEmail, { email });
    if (existing) {
      throw new Error("هذا البريد مسجّل لدينا بالفعل. سجّل الدخول بدلاً من إنشاء حساب جديد.");
    }

    const passwordHash = await hashPassword(args.password);
    const userId: Id<"users"> = await ctx.runMutation(internal.auth._insertUser, {
      role: args.role,
      email,
      passwordHash,
      name: args.name,
      companyName: args.companyName,
      university: args.university,
      website: args.website,
      nationalId: args.nationalId,
      mobileNumber: args.mobileNumber,
      academicLevel: args.academicLevel,
      specialization: args.specialization,
      skills: args.skills,
      languages: args.languages,
      hobbies: args.hobbies,
      experiences: args.experiences,
      entityType: args.entityType,
      entityName: args.entityName,
      commercialRegistration: args.commercialRegistration,
      activities: args.activities,
      crValidityDate: args.crValidityDate,
      companyAge: args.companyAge,
      companyProfileFile: args.companyProfileFile,
      crFile: args.crFile,
      zakatCertificate: args.zakatCertificate,
      taxCertificate: args.taxCertificate,
      contactNumber: args.contactNumber,
    });

    const token = randomToken();
    await ctx.runMutation(internal.auth._createSession, {
      userId,
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { token, userId };
  },
});

export const signIn = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ token: string; userId: Id<"users"> }> => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.runQuery(internal.auth._getUserByEmail, { email });
    if (!user) {
      throw new Error("البريد أو كلمة المرور غير صحيحة. تحقّق من بياناتك وحاول مجدداً.");
    }
    const hash = await hashPassword(args.password);
    if (hash !== user.passwordHash) {
      throw new Error("البريد أو كلمة المرور غير صحيحة. تحقّق من بياناتك وحاول مجدداً.");
    }

    const token = randomToken();
    await ctx.runMutation(internal.auth._createSession, {
      userId: user._id,
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { token, userId: user._id };
  },
});

export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

export const me = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    const { passwordHash: _ph, ...safe } = user;
    return safe;
  },
});
