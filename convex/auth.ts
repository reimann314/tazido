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

export const _getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
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
    const clean = Object.fromEntries(
      Object.entries(args).filter(([_, v]) => v !== undefined),
    ) as typeof args;
    return await ctx.db.insert("users", clean);
  },
});

export const _createSession = internalMutation({
  args: { userId: v.id("users"), token: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", args);
  },
});

export const _updateUser = internalMutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      emailVerified: v.optional(v.boolean()),
      verificationToken: v.optional(v.string()),
      resetToken: v.optional(v.string()),
      resetTokenExpires: v.optional(v.number()),
      passwordHash: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { userId, updates }) => {
    await ctx.db.patch(userId, updates);
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

    const verificationToken = randomToken();
    await ctx.runMutation(internal.auth._updateUser, {
      userId,
      updates: { verificationToken },
    });

    const sessionToken = randomToken();
    await ctx.runMutation(internal.auth._createSession, {
      userId,
      token: sessionToken,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    // Send emails via Resend
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM ?? "Tazid <onboarding@resend.dev>";
      const displayName = args.role === "company" ? args.companyName : args.name;
      if (apiKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: email,
            subject: "مرحباً بك في تزيد – تأكيد البريد الإلكتروني",
            html: `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <table align="center" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #1a3a3a, #2d6a5e); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">مرحباً بك في <span style="color: #d4a853;">تزيد</span></h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 18px; color: #333;">مرحباً ${displayName || "عزيزي المستخدم"}،</p>
        <p style="font-size: 15px; color: #666; line-height: 1.8;">
          نشكرك على التسجيل في منصة تزيد. يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك بالكامل.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tazid.co/verify-email?token=${verificationToken}&userId=${userId}"
             style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #1a3a3a, #2d6a5e); color: white; text-decoration: none; border-radius: 8px; font-size: 16px;">
            تأكيد البريد الإلكتروني
          </a>
        </div>
        <p style="font-size: 14px; color: #999; line-height: 1.8;">
          إذا لم تتمكن من الضغط على الزر، انسخ الرابط التالي والصقه في المتصفح:<br>
          <span style="color: #1a3a3a; direction: ltr; display: inline-block; word-break: break-all; font-size: 13px;">
            https://tazid.co/verify-email?token=${verificationToken}&userId=${userId}
          </span>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 13px; color: #999; text-align: center;">
          © 2026 تزيد | جميع الحقوق محفوظة
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to send welcome email", err);
    }

    return { token: sessionToken, userId };
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

    if (user.emailVerified !== true) {
      // Auto-verify existing users who signed up before email verification existed
      if (user.emailVerified === undefined && !user.verificationToken) {
        await ctx.runMutation(internal.auth._updateUser, {
          userId: user._id,
          updates: { emailVerified: true },
        });
      } else {
        throw new Error("يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد أو اضغط على إعادة إرسال رابط التفعيل.");
      }
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

export const verifyEmail = action({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, { token, userId }) => {
    const user = await ctx.runQuery(internal.auth._getUserById, { userId });
    if (!user) throw new Error("المستخدم غير موجود.");
    if (user.verificationToken !== token) throw new Error("رابط التأكيد غير صالح أو منتهي الصلاحية.");
    await ctx.runMutation(internal.auth._updateUser, {
      userId,
      updates: { emailVerified: true, verificationToken: undefined },
    });
    return true;
  },
});

export const resendVerification = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.runQuery(internal.auth._getUserByEmail, { email });
    if (!user) throw new Error("البريد الإلكتروني غير مسجل لدينا.");
    if (user.emailVerified) throw new Error("البريد الإلكتروني مؤكد بالفعل.");

    const newToken = randomToken();
    await ctx.runMutation(internal.auth._updateUser, {
      userId: user._id,
      updates: { verificationToken: newToken },
    });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM ?? "Tazid <onboarding@resend.dev>";
    const displayName = user.role === "company" ? user.companyName : user.name;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: "تأكيد البريد الإلكتروني – تزيد",
          html: `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <table align="center" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #1a3a3a, #2d6a5e); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">تأكيد البريد الإلكتروني</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 18px; color: #333;">مرحباً ${displayName || "عزيزي المستخدم"}،</p>
        <p style="font-size: 15px; color: #666; line-height: 1.8;">
          نرسل لك رابط تأكيد جديد. اضغط على الزر أدناه لتأكيد بريدك الإلكتروني.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tazid.co/verify-email?token=${newToken}&userId=${user._id}"
             style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #1a3a3a, #2d6a5e); color: white; text-decoration: none; border-radius: 8px; font-size: 16px;">
            تأكيد البريد الإلكتروني
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 13px; color: #999; text-align: center;">
          © 2026 تزيد | جميع الحقوق محفوظة
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
        }),
      });
    }
  },
});

export const requestPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.runQuery(internal.auth._getUserByEmail, { email });
    if (!user) {
      // Don't reveal whether the email exists
      return;
    }

    const resetToken = randomToken();
    await ctx.runMutation(internal.auth._updateUser, {
      userId: user._id,
      updates: {
        resetToken,
        resetTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      },
    });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM ?? "Tazid <onboarding@resend.dev>";
    const displayName = user.role === "company" ? user.companyName : user.name;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: "إعادة تعيين كلمة المرور – تزيد",
          html: `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <table align="center" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #1a3a3a, #2d6a5e); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">إعادة تعيين كلمة المرور</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 18px; color: #333;">مرحباً ${displayName || "عزيزي المستخدم"}،</p>
        <p style="font-size: 15px; color: #666; line-height: 1.8;">
          تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في تزيد. الرابط صالح لمدة ساعة واحدة.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tazid.co/reset-password?token=${resetToken}&userId=${user._id}"
             style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #1a3a3a, #2d6a5e); color: white; text-decoration: none; border-radius: 8px; font-size: 16px;">
            إعادة تعيين كلمة المرور
          </a>
        </div>
        <p style="font-size: 14px; color: #999; line-height: 1.8;">
          إذا لم تقم بطلب إعادة التعيين، تجاهل هذا البريد.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 13px; color: #999; text-align: center;">
          © 2026 تزيد | جميع الحقوق محفوظة
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
        }),
      });
    }
  },
});

export const resetPassword = action({
  args: { token: v.string(), userId: v.id("users"), newPassword: v.string() },
  handler: async (ctx, { token, userId, newPassword }) => {
    if (newPassword.length < 6) {
      throw new Error("كلمة المرور قصيرة، يجب أن تحتوي على ٦ أحرف على الأقل");
    }

    const user = await ctx.runQuery(internal.auth._getUserById, { userId });
    if (!user) throw new Error("المستخدم غير موجود.");
    if (user.resetToken !== token) throw new Error("الرابط غير صالح.");
    if (!user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
      throw new Error("انتهت صلاحية الرابط. يرجى طلب رابط جديد.");
    }

    const passwordHash = await hashPassword(newPassword);
    await ctx.runMutation(internal.auth._updateUser, {
      userId,
      updates: { passwordHash, resetToken: undefined, resetTokenExpires: undefined },
    });
  },
});
