import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    role: v.union(v.literal("student"), v.literal("company")),
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    university: v.optional(v.string()),
    website: v.optional(v.string()),
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
});
