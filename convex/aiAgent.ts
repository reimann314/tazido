/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "createOpportunity",
      description: "إنشاء فرصة تدريب أو تطوع أو إقامة مهنية جديدة",
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
      description: "البحث عن طلاب حسب التخصص والمهارات",
      parameters: {
        type: "object",
        properties: {
          specialization: { type: "string", description: "التخصص" },
          skills: { type: "string", description: "المهارات" },
          university: { type: "string", description: "الجامعة" },
        },
        required: [],
      },
    },
  },
];

async function callGroq(messages: any[], tools?: any[]): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key not set");
  const body: any = { model: MODEL, messages, temperature: 0.7, max_tokens: 2048 };
  if (tools) { body.tools = tools; body.tool_choice = "auto"; }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("AI error: " + (await res.text()).slice(0, 300));
  return await res.json();
}

export const agenticChat = action({
  args: {
    token: v.string(),
    message: v.string(),
    history: v.array(v.object({ role: v.string(), text: v.string() })),
  },
  handler: async (ctx, { token, message, history }) => {
    const user = await ctx.runQuery(internal.auth._getSessionUser, { token });
    if (!user) throw new Error("الجلسة غير صالحة");

    const roleInfo = user.role === "company"
      ? `الشركة: ${user.companyName || "غير محدد"}\nالصلاحية: شركة`
      : `الطالب: ${user.name || "غير محدد"}\nالصلاحية: طالب`;

    const systemPrompt = `أنت المساعد الذكي لمنصة "تزيد" — منصة سعودية تربط الشركات بالطلاب.

المستخدم الحالي:
${roleInfo}

أنت تملك أدوات لتنفيذ الإجراءات. عندما يطلب المستخدم إجراءً:
1. استخدم الأداة المناسبة
2. سيطلب منك المستخدم التأكيد قبل التنفيذ
3. بعد التأكيد، سيتم تنفيذ الإجراء تلقائياً

تحدث باللغة العربية الفصحى.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.text })),
      { role: "user", content: message },
    ];

    const data = await callGroq(messages, TOOLS);
    const choice = data?.choices?.[0];
    if (!choice) return { response: "عذراً، لم أتمكن من معالجة طلبك.", pending: null };

    const toolCalls = choice.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const pending = toolCalls[0];
      const args = JSON.parse(pending.function.arguments);

      // Generate description of what will happen
      let description = "";
      switch (pending.function.name) {
        case "createOpportunity":
          description = `إنشاء فرصة جديدة:\n- العنوان: ${args.title}\n- الموقع: ${args.location}\n- النوع: ${args.type === "internship" ? "تدريب" : args.type === "full-time" ? "دوام كامل" : "دوام جزئي"}`;
          break;
        case "searchStudents":
          description = `البحث عن طلاب${args.specialization ? ` في تخصص: ${args.specialization}` : ""}${args.skills ? ` بمهارات: ${args.skills}` : ""}`;
          break;
        default:
          description = `تنفيذ: ${pending.function.name}`;
      }

      return {
        response: choice.message?.content || "",
        pending: {
          name: pending.function.name,
          args,
          description,
        },
      };
    }

    return { response: choice.message?.content || "كيف يمكنني مساعدتك؟", pending: null };
  },
});

export const executeTool = action({
  args: {
    token: v.string(),
    toolName: v.string(),
    args: v.any(),
  },
  handler: async (ctx, { token, toolName, args }) => {
    let result = "";

    switch (toolName) {
      case "createOpportunity": {
        await ctx.runMutation(api.jobs.create, {
          token,
          title: args.title,
          description: args.description,
          location: args.location,
          type: args.type,
        });
        result = `✅ تم إنشاء الفرصة بنجاح!\nالعنوان: ${args.title}\nالموقع: ${args.location}\nالنوع: ${args.type === "internship" ? "تدريب" : args.type === "full-time" ? "دوام كامل" : "دوام جزئي"}`;
        break;
      }
      case "searchStudents": {
        const students = await ctx.runQuery(api.search.searchStudents, {
          token,
          specialization: args.specialization || undefined,
          skills: args.skills || undefined,
          university: args.university || undefined,
        });
        if (students.length === 0) {
          result = "لم يتم العثور على طلاب مطابقين.";
        } else {
          result = `✅ تم العثور على ${students.length} طالب:\n` +
            students.map((s: any, i: number) =>
              `  ${i + 1}. ${s.name || "غير محدد"}${s.specialization ? ` - ${s.specialization}` : ""}${s.university ? ` (${s.university})` : ""}`
            ).join("\n");
        }
        break;
      }
      default:
        result = `أداة غير معروفة: ${toolName}`;
    }

    return { result };
  },
});
