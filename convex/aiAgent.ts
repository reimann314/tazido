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
      description: "إنشاء فرصة تدريب أو تطوع أو إقامة مهنية جديدة في المنصة. تستخدمها الشركات لنشر الفرص.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "عنوان الفرصة (مثال: تدريب في تطوير الويب)" },
          description: { type: "string", description: "وصف تفصيلي للفرصة يشمل المهام والمهارات المطلوبة" },
          location: { type: "string", description: "موقع الفرصة (مثال: الرياض، عن بعد)" },
          type: { type: "string", enum: ["internship", "full-time", "part-time"], description: "نوع الفرصة: تدريب, دوام كامل, دوام جزئي" },
        },
        required: ["title", "description", "location", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchStudents",
      description: "البحث عن طلاب حسب التخصص أو المهارات أو الجامعة. تستخدمها الشركات للعثور على مرشحين.",
      parameters: {
        type: "object",
        properties: {
          specialization: { type: "string", description: "التخصص المطلوب (مثال: هندسة برمجيات، تسويق)" },
          skills: { type: "string", description: "المهارات المطلوبة (مثال: Python, React)" },
          university: { type: "string", description: "الجامعة (اختياري)" },
          limit: { type: "number", description: "عدد النتائج المطلوب (أقصى 10)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sendMessageToStudent",
      description: "إرسال رسالة مباشرة إلى طالب معين. تستخدمها الشركات للتواصل مع المرشحين.",
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
];

function buildSystemPrompt(role: string, name?: string, companyName?: string): string {
  const base = `أنت المساعد الذكي لمنصة "تزيد" — منصة سعودية تربط الشركات بالطلاب والمواهب للتدريب والإقامة المهنية والتطوع.

أنت تملك القدرة على تنفيذ الإجراءات في المنصة نيابة عن المستخدم باستخدام الأدوات المتاحة.
عندما يطلب منك المستخدم شيئاً، استخدم الأداة المناسبة لتنفيذه.

مهم: تحدث باللغة العربية الفصحى دائماً.
مهم: قبل تنفيذ أي إجراء، اشرح للمستخدم ما ستفعله بالضبط واسأله للتأكيد.`;

  if (role === "company") {
    return `${base}

المستخدم الحالي هو شركة.
اسم الشركة: ${companyName || "غير محدد"}

الصلاحيات المتاحة:
- إنشاء فرص تدريب وتطوع وإقامة مهنية
- البحث عن طلاب حسب التخصص والمهارات
- إرسال رسائل للطلاب
- جدولة مقابلات
- تقديم عروض توظيف

الأدوات المتاحة لك:
1. createOpportunity - لإنشاء فرصة جديدة
2. searchStudents - للبحث عن طلاب
3. sendMessageToStudent - لإرسال رسالة لطالب`;
  }

  return `${base}

المستخدم الحالي هو طالب.
الاسم: ${name || "غير محدد"}

الصلاحيات المتاحة:
- تصفح الفرص المتاحة
- التقديم على الفرص
- التواصل مع الشركات

الأدوات المتاحة للطلاب ستتاح قريباً.`;
}

async function callGroq(messages: unknown[], tools?: unknown[]): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("مفتاح API غير مضبوط");

  const body: any = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  };
  if (tools) body.tools = tools;
  if (tools) body.tool_choice = "auto";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("خطأ AI (" + res.status + "): " + err.slice(0, 300));
  }

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
    if (!user) throw new Error("الجلسة غير صالحة، يرجى تسجيل الدخول");

    const systemPrompt = buildSystemPrompt(
      user.role,
      user.name,
      user.companyName,
    );

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.text })),
      { role: "user", content: message },
    ];

    const data = await callGroq(messages, TOOLS);
    const choice = data?.choices?.[0];
    if (!choice) return { response: "عذراً، لم أتمكن من معالجة طلبك.", actions: [] };

    const toolCalls = choice.message?.tool_calls;
    const content = choice.message?.content;

    const actions: { name: string; args: any; result: string }[] = [];

    if (toolCalls && toolCalls.length > 0) {
      for (const call of toolCalls) {
        const args = JSON.parse(call.function.arguments);
        let result = "";

        try {
          switch (call.function.name) {
            case "createOpportunity": {
              const jobId = await ctx.runMutation(api.jobs.create, {
                token,
                title: args.title,
                description: args.description,
                location: args.location,
                type: args.type,
              });
              result = `✅ تم إنشاء الفرصة بنجاح!\nالعنوان: ${args.title}\nالموقع: ${args.location}\nالنوع: ${args.type === "internship" ? "تدريب" : args.type === "full-time" ? "دوام كامل" : "دوام جزئي"}\nمعرف الفرصة: ${jobId}`;
              break;
            }

            case "searchStudents": {
              const students = await ctx.runQuery(api.search.searchStudents, {
                token,
                specialization: args.specialization || undefined,
                skills: args.skills || undefined,
                university: args.university || undefined,
              });
              const limited = students.slice(0, args.limit || 10);
              if (limited.length === 0) {
                result = "لم يتم العثور على طلاب مطابقين للمعايير.";
              } else {
                result = `تم العثور على ${limited.length} طالب:\n` +
                  limited.map((s: any, i: number) =>
                    `${i + 1}. ${s.name || "غير محدد"} - ${s.specialization || "تخصص غير محدد"}${s.university ? ` - ${s.university}` : ""}`
                  ).join("\n") +
                  `\n\nيمكنك إرسال رسالة لأحدهم باستخدام معرف الطالب (studentId).`;
              }
              break;
            }

            case "sendMessageToStudent": {
              const convId = await ctx.runMutation(api.conversations.getOrCreate, {
                token,
                otherId: args.studentId,
              });
              await ctx.runMutation(api.messages.send, {
                token,
                conversationId: convId,
                body: args.message,
              });
              result = `✅ تم إرسال الرسالة بنجاح إلى الطالب.`;
              break;
            }

            default:
              result = `أداة غير معروفة: ${call.function.name}`;
          }
        } catch (err: any) {
          result = `خطأ أثناء تنفيذ "${call.function.name}": ${err.message}`;
        }

        actions.push({ name: call.function.name, args, result });
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [call],
        });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: result,
        });
      }

      const finalData = await callGroq(messages);
      const finalResponse = finalData?.choices?.[0]?.message?.content || "تمت العملية بنجاح.";
      return { response: finalResponse, actions };
    }

    return { response: content || "كيف يمكنني مساعدتك؟", actions };
  },
});
