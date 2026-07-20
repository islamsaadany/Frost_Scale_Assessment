// The 35 statements of مقياس فروست (Frost Multidimensional Perfectionism
// Scale), transcribed verbatim from the booklet by Dr. Emad Rashad Othman.
//
// Notes on the source:
//  - The booklet prints item 29 twice (page 4). The duplicate is dropped,
//    leaving 35 unique items numbered 1..35.
//  - Every item is a positively-keyed statement rated on a 5-point Likert
//    scale (1 = لا أوافق بشدة … 5 = أوافق بشدة). No item is reverse-scored.

import type { DimensionId } from "./dimensions";

export interface Question {
  /** 1..35, matching the item number in the booklet. */
  id: number;
  dimension: DimensionId;
  text: string;
}

export const QUESTIONS: Question[] = [
  // ── البُعد الأول: الانشغال بالأخطاء (Concern over Mistakes) ──
  { id: 1, dimension: "CM", text: "إذا لم أكن متفوقًا تمام التفوق، أشعر كأنني قد فشلت." },
  { id: 2, dimension: "CM", text: "عندما أرتكب خطأ، أشعر بالخوف أن يراني الآخرون بشكل سيّئ." },
  { id: 3, dimension: "CM", text: "إذا لم تكن الأمور مثالية، أشعر أنه لا فائدة من بذل الجهد لضبطها." },
  { id: 4, dimension: "CM", text: "أتعامل مع الأخطاء التي أرتكبها كأنها فشل شخصي، وإذا فشلت أعتقد أنني شخص فاشل وأتشكك في كفاءتي." },
  { id: 5, dimension: "CM", text: "عندما أعمل على مهمة، أستمر في التفكير في مدى إمكانية قيامي بها بشكل أفضل مما أفعل الآن." },
  { id: 6, dimension: "CM", text: "أشعر بالحرج والخزي والفشل عندما أرتكب خطأ." },
  { id: 7, dimension: "CM", text: "إذا أدى شخص ما مهمة ما بشكل أفضل مني، أشعر كأنني فشلت فيها." },
  { id: 8, dimension: "CM", text: "لا أستطيع صرف التفكير في الأخطاء التي أرتكبها؛ تبقى تُلِحّ على ذهني." },
  { id: 9, dimension: "CM", text: "أخطائي في النهاية ستجعل الآخرين -لا محالة- يحتقرونني أو يكرهونني أو يرفضونني." },

  // ── البُعد الثاني: المعايير الشخصية (Personal Standards) ──
  { id: 10, dimension: "PS", text: "أضع لنفسي أهدافًا عالية مقارنةً بمن حولي (ما أريد أن أحققه)." },
  { id: 11, dimension: "PS", text: "أتوقع من نفسي أن أكون الأفضل في كل شيء أقوم به، وفي كل صغيرة وكبيرة تخصه." },
  { id: 12, dimension: "PS", text: "أشعر أنه يجب أن أحقق أهدافًا بعيدة المنال كي أعتبر نفسي ناجحًا." },
  { id: 13, dimension: "PS", text: "أضع معايير عالية جدًّا لنفسي، وإن لم أفعل أتوقع أن ينتهي بي الأمر «ميديوكر» أو مجرد تابع مهمَّش وغير مرئي." },
  { id: 14, dimension: "PS", text: "لا أشعر بالرضا إلا إذا قدّمت أفضل أداء لديّ." },

  // ── البُعد الثالث: التنظيم والترتيب (Organization) ──
  { id: 15, dimension: "O", text: "أُحب أن تكون الأمور في حياتي منظمة ومنسقة." },
  { id: 16, dimension: "O", text: "أُحب أن أحافظ على مكان عملي نظيفًا ومرتبًا." },
  { id: 17, dimension: "O", text: "التنظيم مهم جدًّا بالنسبة إليّ." },
  { id: 18, dimension: "O", text: "أميل إلى أن أكون دقيقًا في تنظيم أغراضي." },

  // ── البُعد الرابع: التوقعات الوالدية (Parental Expectations) ──
  { id: 19, dimension: "PE", text: "كان والداي يضعان توقعات عالية جدًّا لمستقبلي تفوق ما أتوقعه لنفسي." },
  { id: 20, dimension: "PE", text: "شعرت أن والديَّ يتوقعان مني أن أكون مثاليًّا." },
  { id: 21, dimension: "PE", text: "لم تَكن إنجازاتي تُعَدّ كافيةً في نظر والديَّ؛ في أُسرتنا لا يُقدَّر سوى الإنجازات الكبرى فقط." },

  // ── البُعد الخامس: النقد الوالدي (Parental Criticism) ──
  { id: 22, dimension: "PC", text: "كان والداي ينتقدانني كثيرًا وعوقبت على أخطائي." },
  { id: 23, dimension: "PC", text: "كنت أشعر أنني لا أستطيع إرضاء والديَّ." },
  { id: 24, dimension: "PC", text: "والداي يركِّزان تركيزًا مفرطًا على الأخطاء التي أرتكبها ولم يستطيعا تفهُّمها." },

  // ── البُعد السادس: الشكوك بشأن التصرفات (Doubts about Actions) ──
  { id: 25, dimension: "DA", text: "غالبًا ما أشك فيما إذا كنت قد أنجزت الأمور بشكل صحيح." },
  { id: 26, dimension: "DA", text: "أتحقق من عملي مرارًا وتكرارًا لضمان عدم وجود أخطاء." },
  { id: 27, dimension: "DA", text: "أشعر بعدم اليقين بشأن القرارات التي أتخذها." },
  { id: 28, dimension: "DA", text: "أُراجع أشيائي مرارًا للتأكد من أنني لم أنسَ شيئًا." },
  { id: 29, dimension: "DA", text: "أجد صعوبةً في الاطمئنان إلى أن ما قمتُ به صحيح." },
  { id: 30, dimension: "DA", text: "أُراجع الواجبات أو المهام عدة مرات قبل تسليمها مما يجعلني أتأخر." },
  { id: 31, dimension: "DA", text: "أشك كثيرًا في قدرتي على اتخاذ القرار الصحيح." },

  // ── البُعد السابع: بنود غير مصنفة (Unclassified / General) ──
  { id: 32, dimension: "GEN", text: "أُحب أن أعرف ما يتوقعه الآخرون مني." },
  { id: 33, dimension: "GEN", text: "أشعر بأن عليَّ أن أُنجز الأمور بطريقة معينة." },
  { id: 34, dimension: "GEN", text: "لا أرتاح إلا إذا كانت كل تفاصيل عملي مثالية." },
  { id: 35, dimension: "GEN", text: "أجد نفسي أُعيد ترتيب الأمور حتى تبدو «صحيحة»." },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Question at 1-based position `n` (n === q.id here). */
export function questionAtPosition(n: number): Question | undefined {
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_QUESTIONS) return undefined;
  return BY_ID.get(n);
}
