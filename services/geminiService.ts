
import { GoogleGenAI } from "@google/genai";
import { AnalysisMode } from "../types";

/**
 * Custom error class for configuration-related issues.
 */
class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

const BASE_SYSTEM_INSTRUCTION = `
أنت خبير عالمي في التحليل النفسي الرقمي وتحليل البيانات السلوكية. مهمتك تحليل البيانات المستمدة من الملفات الشخصية على وسائل التواصل الاجتماعي.
يجب أن يكون التقرير باللغة العربية، احترافياً، ومدعوماً بمعادلات إحصائية بصيغة LaTeX.
`;

const PSYCHOLOGICAL_PROMPT = `
التركيز: التحليل النفسي العميق.
المعادلات المطلوبة:
- مؤشر مركزية الذات SCI: $SCI = \frac{\sum P_{self}}{\sum P_{total}} \times 100$
- معامل القلق الاجتماعي SAF: $SAF = \beta \cdot (1 - \frac{R_{inter}}{R_{total}})$
- توازن الظل الرقمي DSB: $DSB = \sqrt{\int_{t_0}^{t_n} \Psi(x) dx}$

الأقسام:
1. النمط النفسي العام.
2. الإحصائيات النفسية الرقمية.
3. تحليل الظل الرقمي (الدوافع الخفية).
4. خارطة طريق التوازن النفسي.
`;

const BEHAVIORAL_PROMPT = `
التركيز: أنماط السلوك الرقمي (Digital Behavior Patterns).
المعادلات المطلوبة:
- معدل تكرار التفاعل IF: $IF = \frac{\Delta Interactions}{\Delta Time}$
- عمق المشاركة Engagement Depth (ED): $ED = \sum_{i=1}^{n} (w_i \cdot v_i)$
- مؤشر تنوع المحتوى Content Diversity Index (CDI): $CDI = 1 - \sum p_i^2$

الأقسام:
1. وتيرة النشاط والتفاعل.
2. قياسات الارتباط الرقمي.
3. عادات الاستهلاك (الوسائط، أوقات الذروة).
4. توصيات تحسين الكفاءة السلوكية.

هام جداً: في نهاية التقرير, قم بتضمين كتلة JSON للرسوم البيانية محاطة بـ [CHART_DATA] و [/CHART_DATA]. 
يجب أن تحتوي الكتلة على بيانات واقعية (تخمينية بناءً على الوصف) كالتالي:
- if_history: مصفوفة من 7 أيام (Day, Value).
- cdi_distribution: مصفوفة من فئات المحتوى (name, value) تشمل (نصوص، صور، روابط، فيديو).
- engagement_metrics: مصفوفة من (name, value) تشمل (إعجابات، مشاركات، تعليقات).

مثال دقيق للكتلة:
[CHART_DATA]
{
  "if_history": [{"day": "السبت", "value": 10}, {"day": "الأحد", "value": 15}, {"day": "الاثنين", "value": 8}, {"day": "الثلاثاء", "value": 20}, {"day": "الأربعاء", "value": 12}, {"day": "الخميس", "value": 25}, {"day": "الجمعة", "value": 18}],
  "cdi_distribution": [{"name": "نصوص", "value": 40}, {"name": "صور", "value": 30}, {"name": "روابط", "value": 15}, {"name": "فيديو", "value": 15}],
  "engagement_metrics": [{"name": "إعجابات", "value": 120}, {"name": "تعليقات", "value": 45}, {"name": "مشاركات", "value": 15}]
}
[/CHART_DATA]
`;

const COMPARISON_PROMPT = `
التركيز: مقارنة تحليلية بين ملفين شخصيين.
المعادلات المطلوبة:
- معامل التشابه الرقمي DSC: $DSC = \frac{2|A \cap B|}{|A| + |B|}$
- فجوة السلوك الرقمي DBG: $DBG = \sqrt{\sum (X_{1,i} - X_{2,i})^2}$

الأقسام:
1. نقاط الالتقاء (التشابهات).
2. نقاط التباين (الاختلافات الجوهرية).
3. تحليل التفاعل المتبادل المحتمل.
4. مقارنة إحصائية شاملة.
`;

const ADVANCED_PROMPT = `
التركيز: تحليل متقدم مخصص بناءً على سمات محددة.
يجب على الذكاء الاصطناعي التركيز بشكل مكثف على السمات أو الأنماط التي حددها المستخدم في "البيانات الإضافية".

المعادلات المطلوبة (اختر الأكثر ملاءمة للسمات المحددة):
- مؤشر التركيز الموضوعي TFI: $TFI = \frac{\sum w_i \cdot f_i}{\sum f_i}$
- معامل الارتباط السلوكي المخصص CBC: $CBC = \rho(X_{user}, Y_{pattern})$

الأقسام:
1. تحليل معمق للسمات المحددة.
2. الارتباطات السلوكية المرتبطة بهذه السمات.
3. استنتاجات نفسية تخصصية.
4. توصيات استراتيجية بناءً على التركيز المختار.
`;

/**
 * Validates and retrieves the Gemini API Key.
 * Throws a ConfigurationError if the key is missing.
 */
const getValidatedApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    throw new ConfigurationError(
      "خطأ في الإعدادات: لم يتم العثور على مفتاح API (Gemini API Key). يرجى التأكد من ضبط متغير البيئة process.env.API_KEY بشكل صحيح."
    );
  }
  
  return apiKey;
};

export const performAnalysis = async (url: string, additionalInfo: string, mode: AnalysisMode, url2?: string): Promise<string> => {
  try {
    const apiKey = getValidatedApiKey();
    
    let instruction = BASE_SYSTEM_INSTRUCTION;
    if (mode === AnalysisMode.PSYCHOLOGICAL) instruction += PSYCHOLOGICAL_PROMPT;
    else if (mode === AnalysisMode.BEHAVIORAL) instruction += BEHAVIORAL_PROMPT;
    else if (mode === AnalysisMode.COMPARISON) instruction += COMPARISON_PROMPT;
    else if (mode === AnalysisMode.ADVANCED) instruction += ADVANCED_PROMPT;

    let prompt = "";
    if (mode === AnalysisMode.COMPARISON) {
      prompt = `قم بإجراء مقارنة تحليلية بين الملفين الشخصيين التاليين:\nالملف الأول: ${url}\nالملف الثاني: ${url2}\nالبيانات الإضافية: ${additionalInfo}\nالمطلوب: تحليل أوجه التشابه والاختلاف النفسية والسلوكية بدقة عالية.`;
    } else if (mode === AnalysisMode.ADVANCED) {
      prompt = `قم بإجراء تحليل متقدم ومخصص للملف الشخصي التالي: ${url}\nالتركيز المطلوب (السمات/الأنماط): ${additionalInfo}\nالمطلوب: تحليل تخصصي يركز بعمق على الجوانب المحددة مع تقديم أدلة رقمية وإحصائية.`;
    } else {
      prompt = `قم بتحليل الملف الشخصي التالي: ${url}\nالبيانات المتاحة: ${additionalInfo}\nالمطلوب: تحليل ${mode === AnalysisMode.PSYCHOLOGICAL ? 'نفسي عميق' : 'سلوكي رقمي شامل'} مع تقديم إحصائيات دقيقة ورسوم بيانية.`;
    }

    // Check if it's an OpenRouter key
    if (apiKey.startsWith('sk-or-')) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Digital Persona Analyst"
        },
        body: JSON.stringify({
          model: "google/gemini-pro-1.5",
          messages: [
            { role: "system", content: instruction },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "فشل الاتصال بـ OpenRouter");
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "لم يتم العثور على نتائج للتحليل.";
    }

    // Check if it's a Bytez key (32 hex characters)
    if (/^[0-9a-f]{32}$/i.test(apiKey)) {
      const response = await fetch("https://api.bytez.com/models/v2/Qwen/Qwen3-4B", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: instruction
            },
            {
              role: "user",
              content: prompt
            }
          ],
          params: {
            min_length: 10,
            max_length: 1000,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل الاتصال بـ Bytez API");
      }

      const data = await response.json();
      // Bytez v2 often returns results in choices[0].message.content for chat-style models
      // or directly logic if it's a stream/completion. Based on the curl, it's chat-like.
      return data.output || data.choices?.[0]?.message?.content || "لم يتم العثور على نتائج للتحليل.";
    }

    // Default to Google SDK
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
        topP: 0.9,
        thinkingConfig: { thinkingBudget: (mode === AnalysisMode.COMPARISON || mode === AnalysisMode.ADVANCED) ? 5000 : 3000 }
      },
    });

    return response.text || "لم يتم العثور على نتائج للتحليل.";
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);

    // Handle ConfigurationError specifically
    if (error instanceof ConfigurationError) {
      throw error;
    }

    // Handle specific API provider errors
    const errorMessage = error.message || "";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("invalid API key") || errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error("عفواً، مفتاح API المستخدم غير صالح أو منتهي الصلاحية. يرجى مراجعة إعدادات API_KEY الخاصة بك.");
    }
    
    if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
      throw new Error("تم حظر الطلب بواسطة فلاتر الأمان. المحتوى قد يكون حساساً جداً للتحليل الآلي.");
    }

    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      throw new Error("تم تجاوز حد الحصص المتاحة (Quota exceeded). يرجى المحاولة مرة أخرى لاحقاً.");
    }

    // Default Arabic error message
    throw new Error("حدث خطأ تقني أثناء محاولة تحليل البيانات. يرجى التأكد من اتصال الإنترنت وصلاحية مفتاح API والمحاولة مرة أخرى.");
  }
};
