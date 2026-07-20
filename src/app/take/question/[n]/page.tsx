import { notFound } from "next/navigation";
import { questionAtPosition, TOTAL_QUESTIONS } from "@/data/questions";
import { QuestionCard } from "./question-card";

export const metadata = { title: "سؤال — مقياس فروست" };

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n: nStr } = await params;
  const n = Number(nStr);
  const question = questionAtPosition(n);
  if (!question) notFound();

  return (
    <QuestionCard
      position={n}
      total={TOTAL_QUESTIONS}
      activeDimension={question.dimension}
      questionId={question.id}
      questionText={question.text}
    />
  );
}
