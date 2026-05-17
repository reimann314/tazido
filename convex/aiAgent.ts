/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

// ─── Tool Definitions ───

const TOOLS = [
  // ── READ TOOLS ──
  {
    type: "function",
    function: {
      name: "getMyJobs",
      description: "عرض جميع الفرص المنشورة الخاصة بالشركة مع عدد المتقدمين لكل فرصة. للشركات فقط.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getApplications",
      description: "عرض المتقدمين لفرصة معينة. للشركات فقط. يجب إعطاء معرف الفرصة.",
      parameters: {
        type: "object",
        properties: { jobId: { type: "string", description: "معرف الفرصة" } },
        required: ["jobId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getStudentProfile",
      description: "عرض الملف الكامل لطالب معين. للشركات فقط.",
      parameters: {
        type: "object",
        properties: { studentId: { type: "string", description: "معرف الطالب" } },
        required: ["studentId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getMyApplications",
      description: "عرض جميع طلباتي المقدمة على الفرص. للطلاب فقط.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getSuggestedJobs",
      description: "عرض الفرص المقترحة المطابقة لتخصصي. للطلاب فقط.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getStats",
      description: "عرض إحصائيات الأداء (عدد الفرص، المتقدمين، المقابلات، إلخ). للشركات فقط.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getShortlists",
      description: "عرض القائمة المختصرة للطلاب المحفوظين. للشركات فقط.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  // ── WRITE TOOLS ──
  {
    type: "function",
    function: {
      name: "createOpportunity",
      description: "إنشاء فرصة تدريب أو تطوع أو إقامة مهنية جديدة. للشركات فقط.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "عنوان الفرصة" },
          description: { type: "string", description: "الوصف التفصيلي" },
          location: { type: "string", description: "الموقع" },
          type: { type: "string", enum: ["internship", "full-time", "part-time"] },
        },
        required: ["title", "description", "location", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchStudents",
      description: "البحث عن طلاب حسب التخصص والمهارات والجامعة. للشركات فقط.",
      parameters: {
        type: "object",
        properties: {
          specialization: { type: "string", description: "التخصص المطلوب" },
          skills: { type: "string", description: "المهارات المطلوبة" },
          university: { type: "string", description: "الجامعة" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sendMessageToStudent",
      description: "إرسال رسالة مباشرة لطالب معين. للشركات فقط.",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "معرف الطالب" },
          message: { type: "string", description: "نص الرسالة" },
        },
        required: ["studentId", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addToShortlist",
      description: "إضافة طالب إلى القائمة المختصرة للشركة. للشركات فقط.",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "معرف الطالب" },
          note: { type: "string", description: "ملاحظة عن الطالب (اختياري)" },
        },
        required: ["studentId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "applyToJob",
      description: "التقديم على فرصة معينة. للطلاب فقط.",
      parameters: {
        type: "object",
        properties: { jobId: { type: "string", description: "معرف الفرصة" } },
        required: ["jobId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createProgram",
      description: "بدء برنامج تدريبي لطالب مقبول. للشركات فقط.",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "معرف الطالب" },
          title: { type: "string", description: "عنوان البرنامج" },
          startDate: { type: "string", description: "تاريخ البداية (مثال: 2026-07-01)" },
        },
        required: ["studentId", "title", "startDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "evaluateStudent",
      description: "تقييم متدرب بعد انتهاء البرنامج التدريبي. للشركات فقط.",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "معرف الطالب" },
          feedback: { type: "string", description: "التقييم والملاحظات" },
          rating: { type: "number", description: "التقييم من 1 إلى 5" },
        },
        required: ["studentId", "feedback", "rating"],
      },
    },
  },
];

// ─── DeepSeek API helper ───

async function callAI(messages: any[], tools?: any[]): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key not set");
  const body: any = { model: MODEL, messages, temperature: 0.7, max_tokens: 4096 };
  if (tools) { body.tools = tools; body.tool_choice = "auto"; body.parallel_tool_calls = false; }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("AI error: " + (await res.text()).slice(0, 300));
  return await res.json();
}

// ─── Description generator for pending actions ───

function getDescription(name: string, args: any): string {
  switch (name) {
    case "getMyJobs": return "عرض جميع الفرص المنشورة";
    case "getApplications": return `عرض المتقدمين للفرصة: ${args.jobId}`;
    case "getStudentProfile": return `عرض الملف الشخصي للطالب`;
    case "getMyApplications": return "عرض طلباتي المقدمة";
    case "getSuggestedJobs": return "عرض الفرص المقترحة حسب تخصصي";
    case "getStats": return "عرض إحصائيات الأداء";
    case "getShortlists": return "عرض القائمة المختصرة";
    case "createOpportunity":
      return `إنشاء فرصة جديدة:\n- العنوان: ${args.title}\n- الموقع: ${args.location}\n- النوع: ${args.type === "internship" ? "تدريب" : args.type === "full-time" ? "دوام كامل" : "دوام جزئي"}`;
    case "searchStudents":
      return `البحث عن طلاب${args.specialization ? ` في تخصص: ${args.specialization}` : ""}${args.skills ? ` بمهارات: ${args.skills}` : ""}`;
    case "sendMessageToStudent": return `إرسال رسالة إلى الطالب`;
    case "addToShortlist": return `إضافة الطالب إلى القائمة المختصرة${args.note ? ` مع ملاحظة: ${args.note}` : ""}`;
    case "applyToJob": return `التقديم على الفرصة: ${args.jobId}`;
    case "createProgram": return `بدء برنامج تدريبي:\n- العنوان: ${args.title}\n- تاريخ البداية: ${args.startDate}`;
    case "evaluateStudent": return `تقييم الطالب بتقييم ${args.rating}/5${args.feedback ? `\n- الملاحظات: ${args.feedback}` : ""}`;
    default: return `تنفيذ: ${name}`;
  }
}

// ─── Execute helper (runs the actual tool) ───

async function executeToolLogic(ctx: any, token: string, me: any, toolName: string, args: any): Promise<string> {
  switch (toolName) {
    // ── READ ──
    case "getMyJobs": {
      const jobs = await ctx.runQuery(api.jobs.listByCompany, { token });
      if (jobs.length === 0) return "لا توجد فرص منشورة حالياً.";
      return `📋 لديك ${jobs.length} فرصة:\n` +
        jobs.map((j: any) => `  • ${j.title} — ${j.status === "open" ? "🟢 مفتوحة" : "🔴 مغلقة"} — ${j.applicantCount || 0} متقدم`).join("\n");
    }
    case "getApplications": {
      const apps = await ctx.runQuery(api.applications.listByJob, { token, jobId: args.jobId });
      if (apps.length === 0) return "لا يوجد متقدمين لهذه الفرصة.";
      return `📋 المتقدمون (${apps.length}):\n` +
        apps.map((a: any, i: number) =>
          `  ${i + 1}. ${a.studentName} — ${a.studentEmail}${a.university ? ` (${a.university})` : ""}`
        ).join("\n");
    }
    case "getStudentProfile": {
      const profile = await ctx.runQuery(api.search.getStudentProfile, { token, studentId: args.studentId });
      if (!profile) return "الطالب غير موجود.";
      let text = `👤 الملف الشخصي:\n- الاسم: ${profile.name || "غير محدد"}\n- التخصص: ${profile.specialization || "غير محدد"}`;
      if (profile.university) text += `\n- الجامعة: ${profile.university}`;
      if (profile.skills) text += `\n- المهارات: ${profile.skills}`;
      if (profile.languages) text += `\n- اللغات: ${profile.languages}`;
      if (profile.experiences) text += `\n- الخبرات: ${profile.experiences}`;
      return text;
    }
    case "getMyApplications": {
      const apps = await ctx.runQuery(api.applications.listByStudent, { token });
      if (apps.length === 0) return "لم تتقدم لأي فرصة بعد.";
      return `📋 طلباتي (${apps.length}):\n` +
        apps.map((a: any) => `  • ${a.jobTitle} — ${a.companyName} — ${a.status === "pending" ? "⏳ قيد المراجعة" : a.status === "reviewed" ? "📋 تمت المراجعة" : a.status === "accepted" ? "✅ مقبول" : "❌ مرفوض"}`).join("\n");
    }
    case "getSuggestedJobs": {
      const suggestions = await ctx.runQuery(api.jobs.listSuggested, { token, limit: 10 });
      if (suggestions.length === 0) return "لا توجد فرص مقترحة حالياً.";
      return `🎯 الفرص المقترحة (${suggestions.length}):\n` +
        suggestions.map((j: any) => `  • ${j.title} — ${j.companyName} (${j.location})${j.matchScore ? ` — نسبة تطابق ${Math.min(100, j.matchScore * 20)}%` : ""}`).join("\n");
    }
    case "getStats": {
      const jobs = await ctx.runQuery(api.jobs.listByCompany, { token });
      const total = jobs.length;
      const open = jobs.filter((j: any) => j.status === "open").length;
      const totalApps = jobs.reduce((sum: number, j: any) => sum + (j.applicantCount || 0), 0);
      return `📊 الإحصائيات:\n- إجمالي الفرص: ${total}\n- الفرص المفتوحة: ${open}\n- إجمالي المتقدمين: ${totalApps}`;
    }
    case "getShortlists": {
      const items = await ctx.runQuery(api.shortlists.list, { token });
      if (items.length === 0) return "القائمة المختصرة فارغة.";
      return `📋 القائمة المختصرة (${items.length}):\n` +
        items.map((item: any) => `  • ${item.studentName}${item.specialization ? ` — ${item.specialization}` : ""}${item.note ? ` (ملاحظة: ${item.note})` : ""}`).join("\n");
    }

    // ── WRITE ──
    case "createOpportunity": {
      await ctx.runMutation(api.jobs.create, { token, title: args.title, description: args.description, location: args.location, type: args.type });
      return `✅ تم إنشاء الفرصة بنجاح!\nالعنوان: ${args.title}\nالموقع: ${args.location}\nالنوع: ${args.type === "internship" ? "تدريب" : args.type === "full-time" ? "دوام كامل" : "دوام جزئي"}`;
    }
    case "searchStudents": {
      const students = await ctx.runQuery(api.search.searchStudents, {
        token, specialization: args.specialization || undefined, skills: args.skills || undefined, university: args.university || undefined,
      });
      if (students.length === 0) return "لم يتم العثور على طلاب مطابقين.";
      return `✅ تم العثور على ${students.length} طالب:\n` +
        students.map((s: any, i: number) =>
          `  ${i + 1}. ${s.name || "غير محدد"}${s.specialization ? ` - ${s.specialization}` : ""}${s.university ? ` (${s.university})` : ""}`
        ).join("\n");
    }
    case "sendMessageToStudent": {
      const convId = await ctx.runMutation(api.conversations.getOrCreate, { token, otherId: args.studentId });
      await ctx.runMutation(api.messages.send, { token, conversationId: convId, body: args.message });
      return `✅ تم إرسال الرسالة بنجاح.`;
    }
    case "addToShortlist": {
      await ctx.runMutation(api.shortlists.add, { token, studentId: args.studentId, note: args.note || undefined });
      return `✅ تم إضافة الطالب إلى القائمة المختصرة.`;
    }
    case "applyToJob": {
      if (me.role !== "student") return "❌ هذه الأداة متاحة للطلاب فقط.";
      await ctx.runMutation(api.applications.apply, { token, jobId: args.jobId });
      return `✅ تم التقديم على الفرصة بنجاح!`;
    }
    case "createProgram": {
      if (me.role !== "company") return "❌ هذه الأداة متاحة للشركات فقط.";
      await ctx.runMutation(api.programs.create, {
        token, studentId: args.studentId, title: args.title, startDate: args.startDate,
      });
      return `✅ تم بدء البرنامج التدريبي بنجاح!\nالعنوان: ${args.title}\nتاريخ البداية: ${args.startDate}`;
    }
    case "evaluateStudent": {
      if (me.role !== "company") return "❌ هذه الأداة متاحة للشركات فقط.";
      const programs = await ctx.runQuery(api.programs.listByCompany, { token });
      const program = programs.find((p: any) => p.studentId === args.studentId && p.status === "active");
      if (!program) return "❌ لم يتم العثور على برنامج تدريبي نشط لهذا الطالب.";
      await ctx.runMutation(api.evaluations.create, {
        token, programId: program._id, type: "company_to_student",
        rating: args.rating, feedback: args.feedback || "",
      });
      return `✅ تم تقييم الطالب بنجاح! التقييم: ${args.rating}/5`;
    }
    default:
      return `أداة غير معروفة: ${toolName}`;
  }
}

// ─── Agentic Chat Action ───

export const agenticChat = action({
  args: { token: v.string(), message: v.string(), history: v.array(v.object({ role: v.string(), text: v.string() })) },
  handler: async (ctx, { token, message, history }) => {
    const user = await ctx.runQuery(internal.auth._getSessionUser, { token });
    if (!user) throw new Error("الجلسة غير صالحة");

    const roleInfo = user.role === "company"
      ? `الشركة: ${user.companyName || "غير محدد"} (صلاحية: شركة)`
      : `الطالب: ${user.name || "غير محدد"} (صلاحية: طالب)`;

    const systemPrompt = `أنت المساعد الذكي لمنصة "تزيد" — منصة سعودية تربط الشركات بالطلاب للتدريب والإقامة المهنية.

المستخدم الحالي:
${roleInfo}

أنت تملك أدوات متعددة لقراءة البيانات وتنفيذ الإجراءات.

قواعد مهمة:
1. قبل تنفيذ أي إجراء (إنشاء، إرسال، تعديل)، استخدم الأداة المناسبة وسيطلب المستخدم التأكيد قبل التنفيذ
2. لقراءة البيانات (عرض، بحث، إحصائيات)، يمكنك التنفيذ فوراً دون انتظار تأكيد
3. إذا طلب المستخدم شيئاً معقداً يتطلب عدة خطوات، يمكنك استخدام عدة أدوات بالتسلسل
4. تحدث باللغة العربية الفصحى دائماً
5. قدم المعلومات بشكل منظم وواضح`;

    const msgs: any[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.text })),
      { role: "user", content: message },
    ];

    const data = await callAI(msgs, TOOLS);
    const choice = data?.choices?.[0];
    if (!choice) return { response: "عذراً، لم أتمكن من معالجة طلبك.", pending: null };

    const toolCalls = choice.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const pending = toolCalls[0];
      const args = JSON.parse(pending.function.arguments);
      const toolName = pending.function.name;

      // Read-only tools execute immediately. Write tools ask for confirmation.
      const readTools = ["getMyJobs", "getApplications", "getStudentProfile", "getMyApplications", "getSuggestedJobs", "getStats", "getShortlists", "searchStudents"];
      const isReadTool = readTools.includes(toolName);

      if (isReadTool) {
        const result = await executeToolLogic(ctx, token, user, toolName, args);
        // Feed the result back to the AI for a natural response
        msgs.push({ role: "assistant", content: null, tool_calls: toolCalls });
        msgs.push({ role: "tool", tool_call_id: pending.id, content: result });
        const finalData = await callAI(msgs);
        const finalResponse = finalData?.choices?.[0]?.message?.content || result;
        return { response: finalResponse, pending: null };
      } else {
        return {
          response: choice.message?.content || "",
          pending: { name: toolName, args, description: getDescription(toolName, args) },
        };
      }
    }

    return { response: choice.message?.content || "كيف يمكنني مساعدتك؟", pending: null };
  },
});

// ─── Execute Tool Action (for confirmed write tools) ───

export const executeTool = action({
  args: { token: v.string(), toolName: v.string(), args: v.any() },
  handler: async (ctx, { token, toolName, args }) => {
    const user = await ctx.runQuery(internal.auth._getSessionUser, { token });
    if (!user) throw new Error("الجلسة غير صالحة");
    const result = await executeToolLogic(ctx, token, user, toolName, args);
    return { result };
  },
});
