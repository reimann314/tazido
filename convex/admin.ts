import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id, Doc } from "./_generated/dataModel";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "::tazid-admin::v1");
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

export const _getAdminByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
  },
});

export const _createAdminSession = internalMutation({
  args: { adminId: v.id("admins"), token: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("adminSessions", args);
  },
});

// ---------- Public: Auth ----------

export const adminLogin = action({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ token: string; adminId: Id<"admins"> }> => {
    const username = args.username.trim().toLowerCase();
    const admin = await ctx.runQuery(internal.admin._getAdminByUsername, { username });
    if (!admin) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");

    const hash = await hashPassword(args.password);
    if (hash !== admin.passwordHash) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");

    const token = randomToken();
    await ctx.runMutation(internal.admin._createAdminSession, {
      adminId: admin._id,
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { token, adminId: admin._id };
  },
});

export const adminMe = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;
    const admin = await ctx.db.get(session.adminId);
    if (!admin) return null;
    const { passwordHash: _ph, ...safe } = admin;
    return safe;
  },
});

export const adminLogout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

// ---------- Dashboard Stats ----------

export const getDashboardStats = query({
  args: { adminToken: v.string() },
  handler: async (ctx, { adminToken }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;

    const allUsers = await ctx.db.query("users").collect();
    const allJobs = await ctx.db.query("jobs").collect();
    const allApps = await ctx.db.query("applications").collect();

    const students = allUsers.filter((u) => u.role === "student");
    const companies = allUsers.filter((u) => u.role === "company");
    const verifiedUsers = allUsers.filter((u) => u.emailVerified === true);
    const openJobs = allJobs.filter((j) => j.status === "open");
    const pendingApps = allApps.filter((a) => a.status === "pending");

    return {
      totalUsers: allUsers.length,
      totalStudents: students.length,
      totalCompanies: companies.length,
      verifiedUsers: verifiedUsers.length,
      totalJobs: allJobs.length,
      openJobs: openJobs.length,
      totalApplications: allApps.length,
      pendingApplications: pendingApps.length,
    };
  },
});

// ---------- User Management ----------

export const getUsers = query({
  args: {
    adminToken: v.string(),
    role: v.optional(v.union(v.literal("student"), v.literal("company"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { adminToken, role, search }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;

    let users = await ctx.db.query("users").collect();

    if (role) users = users.filter((u) => u.role === role);
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.companyName && u.companyName.toLowerCase().includes(q)),
      );
    }

    return users
      .map(({ passwordHash: _ph, ...u }) => u)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getUserById = query({
  args: { adminToken: v.string(), userId: v.id("users") },
  handler: async (ctx, { adminToken, userId }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;
    const { passwordHash: _ph, ...safe } = user;
    return safe;
  },
});

export const updateUser = mutation({
  args: {
    adminToken: v.string(),
    userId: v.id("users"),
    updates: v.object({
      emailVerified: v.optional(v.boolean()),
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
      contactNumber: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { adminToken, userId, updates }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");

    const clean = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    if (Object.keys(clean).length > 0) {
      await ctx.db.patch(userId, clean);
    }
  },
});

export const deleteUser = mutation({
  args: { adminToken: v.string(), userId: v.id("users") },
  handler: async (ctx, { adminToken, userId }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);

    if (user.role === "company") {
      const jobs = await ctx.db
        .query("jobs")
        .withIndex("by_company", (q) => q.eq("companyId", userId))
        .collect();
      for (const job of jobs) {
        const apps = await ctx.db
          .query("applications")
          .withIndex("by_job", (q) => q.eq("jobId", job._id))
          .collect();
        for (const app of apps) await ctx.db.delete(app._id);
        await ctx.db.delete(job._id);
      }
    }

    if (user.role === "student") {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", userId))
        .collect();
      for (const app of apps) await ctx.db.delete(app._id);
    }

    await ctx.db.delete(userId);
  },
});

// ---------- Job Management ----------

export const getJobs = query({
  args: { adminToken: v.string(), status: v.optional(v.union(v.literal("open"), v.literal("closed"))) },
  handler: async (ctx, { adminToken, status }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;

    let jobs = await ctx.db.query("jobs").collect();
    if (status) jobs = jobs.filter((j) => j.status === status);
    return jobs.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const updateJobStatus = mutation({
  args: { adminToken: v.string(), jobId: v.id("jobs"), status: v.union(v.literal("open"), v.literal("closed")) },
  handler: async (ctx, { adminToken, jobId, status }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    await ctx.db.patch(jobId, { status });
  },
});

export const deleteJob = mutation({
  args: { adminToken: v.string(), jobId: v.id("jobs") },
  handler: async (ctx, { adminToken, jobId }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
    for (const app of apps) await ctx.db.delete(app._id);
    await ctx.db.delete(jobId);
  },
});

// ---------- Application Management ----------

export const getApplications = query({
  args: {
    adminToken: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("reviewed"), v.literal("accepted"), v.literal("rejected"))),
  },
  handler: async (ctx, { adminToken, status }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;

    let apps = await ctx.db.query("applications").collect();
    if (status) apps = apps.filter((a) => a.status === status);
    return apps.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const updateApplicationStatus = mutation({
  args: {
    adminToken: v.string(),
    applicationId: v.id("applications"),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, { adminToken, applicationId, status }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", adminToken))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    await ctx.db.patch(applicationId, { status });
  },
});
