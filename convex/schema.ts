import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const counterValidator = v.object({
  totalUsers: v.number(),
  totalStudents: v.number(),
  totalCompanies: v.number(),
  verifiedUsers: v.number(),
  verifiedCompanies: v.number(),
  totalJobs: v.number(),
  openJobs: v.number(),
  totalApplications: v.number(),
  pendingApplications: v.number(),
});

export default defineSchema({
  users: defineTable({
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
    cvStorageId: v.optional(v.id("_storage")),
    emailVerified: v.optional(v.boolean()),
    verificationToken: v.optional(v.string()),
    resetToken: v.optional(v.string()),
    resetTokenExpires: v.optional(v.number()),
    verified: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  jobs: defineTable({
    companyId: v.id("users"),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("internship"),
      v.literal("full-time"),
      v.literal("part-time"),
    ),
    status: v.union(v.literal("open"), v.literal("closed")),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_status", ["status"]),

  admins: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    displayName: v.string(),
  }).index("by_username", ["username"]),

  adminSessions: defineTable({
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_admin", ["adminId"]),

  loginAttempts: defineTable({
    email: v.string(),
    attemptedAt: v.number(),
  }).index("by_email", ["email"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  applications: defineTable({
    jobId: v.id("jobs"),
    studentId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    appliedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_job", ["jobId"])
    .index("by_student_and_job", ["studentId", "jobId"]),

  stats: defineTable(counterValidator),

  shortlists: defineTable({
    companyId: v.id("users"),
    studentId: v.id("users"),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_and_student", ["companyId", "studentId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
    lastMessageAt: v.optional(v.number()),
    lastMessageBody: v.optional(v.string()),
    lastMessageSender: v.optional(v.id("users")),
    createdAt: v.number(),
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),

  interviews: defineTable({
    companyId: v.id("users"),
    studentId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
    proposedSlots: v.array(v.number()),
    selectedSlot: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_student", ["studentId"]),

  offers: defineTable({
    companyId: v.id("users"),
    studentId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
    title: v.string(),
    salary: v.optional(v.string()),
    startDate: v.string(),
    terms: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn"),
    ),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_student", ["studentId"]),
});
