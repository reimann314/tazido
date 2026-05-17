import { v } from "convex/values";
import { action } from "./_generated/server";

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-v4-flash";

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("مفتاح API غير مضبوط");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("خطأ AI (" + res.status + "): " + err.slice(0, 300));
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "عذراً، لم أتمكن من إنشاء رد.";
}

export const generateDescription = action({
  args: {
    title: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (_ctx, { title, details }) => {
    const systemPrompt = "أنت مساعد متخصص في كتابة وصف الفرص التدريبية والمهنية باللغة العربية الفصحى.";
    const userPrompt = `اكتب وصفاً احترافياً لفرصة تدريبية أو مهنية في السعودية.

عنوان الفرصة: ${title}
${details ? `تفاصيل إضافية: ${details}` : ""}

المطلوب في الرد:
- وصف مختصر وجذاب (3-4 جمل)
- المهارات المطلوبة (نقاط)
- المميزات (نقاط)

اكتب الرد باللغة العربية الفصحى.`;

    return await callAI(systemPrompt, userPrompt);
  },
});

export const askAssistant = action({
  args: {
    question: v.string(),
  },
  handler: async (_ctx, { question }) => {
    const systemPrompt = `أنت مساعد منصة "تزيد" — منصة سعودية تربط الشركات بالطلاب والمواهب للتدريب والإقامة المهنية والتطوع.

مهام المنصة:
- الشركات تنشر فرص تدريب وتطوع وإقامة مهنية
- الطلاب يتصفحون الفرص ويقدمون طلبات
- مقابلات وجدولة مواعيد
- عروض توظيف
- برامج تدريبية مع تقييم
- محادثات مباشرة بين الشركات والطلاب
- إدارة فريق العمل (حسابات متعددة لنفس الشركة)

أجب باللغة العربية الفصحى، بإيجاز وفي حدود معرفتك بالمنصة. إذا كان السؤال خارج نطاق المنصة، قل أن هذا خارج اختصاصك.`;
    const userPrompt = question;

    return await callAI(systemPrompt, userPrompt);
  },
});
