
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
    const ai = new GoogleGenAI({ apiKey });
    
    let instruction = BASE_SYSTEM_INSTRUCTION;
    if (mode === AnalysisMode.PSYCHOLOGICAL) instruction += PSYCHOLOGICAL_PROMPT;
    else if (mode === AnalysisMode.BEHAVIORAL) instruction += BEHAVIORAL_PROMPT;
    else if (mode === AnalysisMode.COMPARISON) instruction += COMPARISON_PROMPT;

    let prompt = "";
    if (mode === AnalysisMode.COMPARISON) {
      prompt = `قم بإجراء مقارنة تحليلية بين الملفين الشخصيين التاليين:\nالملف الأول: ${url}\nالملف الثاني: ${url2}\nالبيانات الإضافية: ${additionalInfo}\nالمطلوب: تحليل أوجه التشابه والاختلاف النفسية والسلوكية بدقة عالية.`;
    } else {
      prompt = `قم بتحليل الملف الشخصي التالي: ${url}\nالبيانات المتاحة: ${additionalInfo}\nالمطلوب: تحليل ${mode === AnalysisMode.PSYCHOLOGICAL ? 'نفسي عميق' : 'سلوكي رقمي شامل'} مع تقديم إحصائيات دقيقة ورسوم بيانية.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
        topP: 0.9,
        thinkingConfig: { thinkingBudget: mode === AnalysisMode.COMPARISON ? 5000 : 3000 }
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
