# مقياس فروست — Product & Scoring Specification

The instrument implemented here is the **Frost Multidimensional
Perfectionism Scale (مقياس فروست)** — Arabic edition by Dr. Emad Rashad
Othman (`emadrashad.net`). This document is the source of truth for the
methodology. The implementation reads its fixed content from `src/data/*`;
keep the two in sync.

## Concept

- **Type:** self-report questionnaire, 5-point Likert.
- **Items:** 35 positively-keyed statements (no reverse-scored items).
- **Scale:** `1 = لا أوافق بشدة`, `2 = لا أوافق`, `3 = محايد`,
  `4 = أوافق`, `5 = أوافق بشدة`.
- **Output:** per-dimension raw sums mapped to 4 bands, plus a total
  "general perfectionism" score. Reporting is **individual** (one report
  per respondent); there is no cohort aggregation.
- **Access:** code-gated — an admin issues an access code, a respondent
  validates it to open a session, answers the 35 items, and receives their
  own report.

## Dimensions (الأبعاد)

| # | Dimension | English | Items | Count |
|---|-----------|---------|-------|-------|
| 1 | الانشغال بالأخطاء | Concern over Mistakes | 1–9 | 9 |
| 2 | المعايير الشخصية | Personal Standards | 10–14 | 5 |
| 3 | التنظيم والترتيب | Organization | 15–18 | 4 |
| 4 | التوقعات الوالدية | Parental Expectations | 19–21 | 3 |
| 5 | النقد الوالدي | Parental Criticism | 22–24 | 3 |
| 6 | الشكوك بشأن التصرفات | Doubts about Actions | 25–31 | 7 |
| 7 | بنود عامة | General (Unclassified) | 32–35 | 4 |

## Bands (الفئات)

Four bands per dimension: `منخفض (low)`, `متوسط (mid)`, `عالية (high)`,
`مرضية شديدة (severe)`. Thresholds (inclusive):

| Dimension | Range | منخفض | متوسط | عالية | مرضية شديدة |
|-----------|-------|-------|-------|-------|-------------|
| 1 · CM | 9–45 | 9–18 | 19–29 | 30–40 | 41–45 |
| 2 · PS | 5–25 | 5–10 | 11–15 | 16–20 | 21–25 |
| 3 · O | 4–20 | 4–8 | 9–12 | 13–17 | 18–20 |
| 4 · PE | 3–15 | 3 | 4–6 | 7–10 | 11–15 |
| 5 · PC | 3–15 | 3 | 4–6 | 7–10 | 11–15 |
| 6 · DA | 7–35 | 7–14 | 15–21 | 22–28 | 29–35 |
| 7 · GEN | 4–20 | 4–8 | 9–12 | 13–17 | 18–20 |
| **Total** | 35–175 | 35–70 | 71–105 | 106–155 | 156–175 |

## Corrections against the source booklet

The printed booklet has two errors, corrected here and flagged in code:

1. **Item 29 is printed twice** (page 4). The duplicate is dropped, so the
   scale has 35 unique items and dimension 6 (DA) has 7 items (25–31).
2. **Dimension 6's high/severe thresholds are misprinted** (they repeat
   another dimension's numbers: `عالية 13:17`, `شديدة >17`). They are
   corrected to a consistent ramp over the 7-item range: `22–28` / `29–35`.

If the author supplies an authoritative revision, update the tables above
and `src/data/dimensions.ts` together.

## Reporting

The individual report shows: the total score with its band, a 7-axis
spider chart of the dimension profile, and a per-dimension breakdown
(raw/max, band, a fixed intro, a band-specific summary, and — for
high/severe bands — a short guidance line). All narrative copy is fixed
(no AI) and lives in `src/data/report-content.ts`.

The report is **educational / reflective, not diagnostic**. A disclaimer
to that effect is always shown (`DISCLAIMER` in `report-content.ts`).

## Where the content lives

| Content | File |
|---------|------|
| The 35 statements + item→dimension map | `src/data/questions.ts` |
| Dimensions, band thresholds, total scale | `src/data/dimensions.ts` |
| Likert labels, titles, band styling | `src/data/constants.ts` |
| Fixed report narrative per dimension × band | `src/data/report-content.ts` |
| Scoring engine (sum → band) | `src/lib/scoring.ts` |
| Report assembly | `src/lib/report.ts` |
