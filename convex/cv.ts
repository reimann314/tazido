import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveCv = mutation({
  args: {
    token: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { token, storageId }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "student") throw new Error("غير مصرّح");
    await ctx.db.patch(user._id, { cvStorageId: storageId });
    return true;
  },
});

export const getCvUrl = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user.cvStorageId) return null;
    return await ctx.storage.getUrl(user.cvStorageId);
  },
});

export const getStudentCvUrl = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    const student = await ctx.db.get(studentId);
    if (!student || !student.cvStorageId) return null;
    return await ctx.storage.getUrl(student.cvStorageId);
  },
});

export const deleteCv = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "student") throw new Error("غير مصرّح");
    if (!user.cvStorageId) return;
    await ctx.storage.delete(user.cvStorageId);
    await ctx.db.patch(user._id, { cvStorageId: undefined });
    return true;
  },
});
