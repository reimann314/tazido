import { v } from "convex/values";
import { query } from "./_generated/server";
import { getUserFromToken } from "./sessionHelpers";
import type { Doc } from "./_generated/dataModel";

export const searchStudents = query({
  args: {
    token: v.string(),
    specialization: v.optional(v.string()),
    skills: v.optional(v.string()),
    university: v.optional(v.string()),
    academicLevel: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { token, specialization, skills, university, academicLevel, search }) => {
    const user = await getUserFromToken(ctx, token);
    if (user.role !== "company") throw new Error("غير مصرّح");

    const all = await ctx.db.query("users").take(200);
    let results = all.filter((u): u is Doc<"users"> & { role: "student" } => u.role === "student");

    if (specialization) {
      const q = specialization.toLowerCase();
      results = results.filter((s) => s.specialization?.toLowerCase().includes(q));
    }
    if (skills) {
      const terms = skills.split(/[،,]/).map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (terms.length > 0) {
        results = results.filter((s) =>
          terms.some((term) => s.skills?.toLowerCase().includes(term)),
        );
      }
    }
    if (university) {
      const q = university.toLowerCase();
      results = results.filter((s) => s.university?.toLowerCase().includes(q));
    }
    if (academicLevel) {
      results = results.filter((s) => s.academicLevel === academicLevel);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.specialization && s.specialization.toLowerCase().includes(q)) ||
          (s.skills && s.skills.toLowerCase().includes(q)) ||
          (s.university && s.university.toLowerCase().includes(q)),
      );
    }

    return await Promise.all(
      results.map(async (s) => {
        let cvUrl: string | null = null;
        if (s.cvStorageId) {
          cvUrl = await ctx.storage.getUrl(s.cvStorageId);
        }
        return {
          _id: s._id,
          name: s.name,
          email: s.email,
          specialization: s.specialization,
          university: s.university,
          academicLevel: s.academicLevel,
          skills: s.skills,
          mobileNumber: s.mobileNumber,
          cvUrl,
        };
      }),
    );
  },
});

export const getStudentProfile = query({
  args: { token: v.string(), studentId: v.id("users") },
  handler: async (ctx, { token, studentId }) => {
    const company = await getUserFromToken(ctx, token);
    if (company.role !== "company") throw new Error("غير مصرّح");

    const student = await ctx.db.get(studentId);
    if (!student || student.role !== "student") return null;

    let cvUrl: string | null = null;
    if (student.cvStorageId) {
      cvUrl = await ctx.storage.getUrl(student.cvStorageId);
    }

    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      mobileNumber: student.mobileNumber,
      nationalId: student.nationalId,
      academicLevel: student.academicLevel,
      specialization: student.specialization,
      university: student.university,
      skills: student.skills,
      languages: student.languages,
      hobbies: student.hobbies,
      experiences: student.experiences,
      entityType: student.entityType,
      entityName: student.entityName,
      cvUrl,
    };
  },
});

export const getCompanyProfileById = query({
  args: { companyId: v.id("users") },
  handler: async (ctx, { companyId }) => {
    const company = await ctx.db.get(companyId);
    if (!company || company.role !== "company") return null;
    return {
      _id: company._id,
      companyName: company.companyName,
      website: company.website,
      activities: company.activities,
      contactNumber: company.contactNumber,
      commercialRegistration: company.commercialRegistration,
      companyAge: company.companyAge,
      verified: company.verified === true,
      email: company.email,
    };
  },
});
