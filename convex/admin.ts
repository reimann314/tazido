import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const HASH_ALGORITHM = "pbkdf2-sha256";
const HASH_ITERATIONS = 100_000;
const HASH_KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function encodeBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(str: string): Uint8Array {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: HASH_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    HASH_KEY_LENGTH * 8,
  );
  return `$${HASH_ALGORITHM}$${HASH_ITERATIONS}$${encodeBase64(salt)}$${
    encodeBase64(hash)
  }`;
}

function isOldFormat(storedHash: string): boolean {
  return !storedHash.startsWith("$");
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (isOldFormat(storedHash)) {
    const data = new TextEncoder().encode(password + "::tazid-admin::v1");
    const buf = await crypto.subtle.digest("SHA-256", data);
    const computed = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return computed === storedHash;
  }
  const parts = storedHash.split("$");
  if (parts.length !== 5 || parts[1] !== HASH_ALGORITHM) return false;
  const iterations = parseInt(parts[2], 10);
  const salt = decodeBase64(parts[3]);
  const expectedHash = decodeBase64(parts[4]);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations, hash: "SHA-256" },
    keyMaterial,
    expectedHash.length * 8,
  );
  const hashBytes = new Uint8Array(hash);
  return (
    hashBytes.length === expectedHash.length &&
    hashBytes.every((b, i) => b === expectedHash[i])
  );
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

export const _updateAdmin = internalMutation({
  args: { adminId: v.id("admins"), passwordHash: v.string() },
  handler: async (ctx, { adminId, passwordHash }) => {
    await ctx.db.patch(adminId, { passwordHash });
  },
});

// ---------- Public: Auth ----------

export const adminLogin = action({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ token: string; adminId: Id<"admins"> }> => {
    const username = args.username.trim().toLowerCase();
    const admin = await ctx.runQuery(internal.admin._getAdminByUsername, { username });
    if (!admin) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");

    const matched = await verifyPassword(args.password, admin.passwordHash);
    if (!matched) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");

    // Upgrade old-format password hash
    if (isOldFormat(admin.passwordHash)) {
      const newHash = await hashPassword(args.password);
      await ctx.runMutation(internal.admin._updateAdmin, {
        adminId: admin._id,
        passwordHash: newHash,
      });
    }

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
    return { ...admin, passwordHash: undefined };
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

    const all = await ctx.db.query("stats").collect();
    return all[0] ?? {
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

    let users = await ctx.db.query("users").take(200);

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
      .map((u) => ({ ...u, passwordHash: undefined }))
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
    return { ...user, passwordHash: undefined };
  },
});

export const updateUser = mutation({
  args: {
    adminToken: v.string(),
    userId: v.id("users"),
    updates: v.object({
      emailVerified: v.optional(v.boolean()),
      verified: v.optional(v.boolean()),
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

    const clean = Object.fromEntries(
      Object.entries(updates).filter((entry) => entry[1] !== undefined),
    );
    if (Object.keys(clean).length > 0) {
      await ctx.db.patch(userId, clean);
    }
    // Update counter when verification status changes
    if (updates.verified !== undefined) {
      await ctx.runMutation(internal.stats._updateVerifiedCounter, {
        userId,
        verified: updates.verified,
      });
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

    let removedJobs = 0;
    let removedApps = 0;
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
        removedApps += apps.length;
        for (const app of apps) await ctx.db.delete(app._id);
        await ctx.db.delete(job._id);
        removedJobs++;
      }
    }

    if (user.role === "student") {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_student", (q) => q.eq("studentId", userId))
        .collect();
      removedApps = apps.length;
      for (const app of apps) await ctx.db.delete(app._id);
    }

    await ctx.db.delete(userId);

    // Update aggregate counters
    await ctx.runMutation(internal.stats._updateUserCounter, {
      op: "decrement",
      role: user.role,
      verified: user.verified ?? false,
    });
    for (let i = 0; i < removedJobs; i++) {
      await ctx.runMutation(internal.stats._updateJobCounter, { op: "decrement" });
    }
    for (let i = 0; i < removedApps; i++) {
      await ctx.runMutation(internal.stats._updateApplicationCounter, { op: "decrement" });
    }
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

    let jobs = await ctx.db.query("jobs").take(200);
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

    let apps = await ctx.db.query("applications").take(200);
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
