import { v } from "convex/values";
import { action } from "./_generated/server";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("مفتاح Gemini API غير مضبوط");

  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("فشل الاتصال بالمساعد الذكي: " + err);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من إنشاء رد.";
}

export const generateDescription = action({
  args: {
    title: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (_ctx, { title, details }) => {
    const prompt = `أنت مساعد متخصص في كتابة وصف الفرص التدريبية والمهنية باللغة العربية الفصحى.
المطلوب: كتابة وصف احترافي لفرصة تدريبية أو مهنية في السعودية.

عنوان الفرصة: ${title}
${details ? `تفاصيل إضافية: ${details}` : ""}

المطلوب في الرد:
- وصف مختصر وجذاب (3-4 جمل)
- المهارات المطلوبة (نقاط)
- المميزات (نقاط)

اكتب الرد باللغة العربية الفصحى.`;

    return await callGemini(prompt);
  },
});

export const askAssistant = action({
  args: {
    question: v.string(),
  },
  handler: async (_ctx, { question }) => {
    const prompt = `أنت مساعد منصة "تزيد" — منصة سعودية تربط الشركات بالطلاب والمواهب للتدريب والإقامة المهنية والتطوع.

مهام المنصة:
- الشركات تنشر فرص تدريب وتطوع وإقامة مهنية
- الطلاب يتصفحون الفرص ويقدمون طلبات
- مقابلات وجدولة مواعيد
- عروض توظيف
- برامج تدريبية مع تقييم
- محادثات مباشرة بين الشركات والطلاب
- إدارة فريق العمل (حسابات متعددة لنفس الشركة)

السؤال: ${question}

أجب باللغة العربية الفصحى، بإيجاز وفي حدود معرفتك بالمنصة. إذا كان السؤال خارج نطاق المنصة، قل أن هذا خارج اختصاصك.`;

    return await callGemini(prompt);
  },
});
