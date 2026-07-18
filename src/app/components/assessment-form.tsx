"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Question = {
  id: string;
  text: string;
  type: "text" | "textarea" | "dropdown" | "radio" | "checkbox";
  required: boolean;
  options: { label: string; value: string }[];
};

type Props = {
  submissionId: string;
  questions: Question[];
  scoringLogic: Record<string, Record<string, number>>;
  knowledgeBase: any;
  isInternal?: boolean;
  token?: string;
  onComplete?: () => void;
};

export default function AssessmentForm({
  submissionId,
  questions,
  scoringLogic,
  knowledgeBase,
  isInternal,
  token,
  onComplete,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState("");

  function updateAnswer(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleCheckbox(questionId: string, optionValue: string) {
    const current: string[] = answers[questionId] ?? [];
    const updated = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    setAnswers((prev) => ({ ...prev, [questionId]: updated }));
  }

  function calculateScore(): number {
    let total = 0;
    for (const q of questions) {
      const answer = answers[q.id];
      if (!answer) continue;
      const logic = scoringLogic[q.id];
      if (!logic) continue;

      if (Array.isArray(answer)) {
        for (const val of answer) {
          total += logic[val] ?? 0;
        }
      } else {
        total += logic[answer] ?? 0;
      }
    }
    return total;
  }

  function getRecommendation(totalScore: number): string {
    const thresholds = knowledgeBase?.thresholds ?? [];
    for (const t of thresholds) {
      if (totalScore >= t.min && totalScore <= t.max) {
        return t.recommendation;
      }
    }
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const totalScore = calculateScore();
    const rec = getRecommendation(totalScore);
    setScore(totalScore);
    setRecommendation(rec);

    const url = token
      ? `/api/assess-by-token/${token}`
      : `/api/submissions/${submissionId}`;

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        status: "COMPLETED",
        finalScore: totalScore,
        recommendationReport: { score: totalScore, recommendation: rec },
      }),
    });

    setSubmitted(true);
    setSubmitting(false);

    if (onComplete) onComplete();
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <h2 className="text-xl font-bold text-green-800">✅ Assessment Completed!</h2>
          {score !== null && (
            <p className="mt-2 text-3xl font-bold text-green-700">{score} pts</p>
          )}
          {recommendation && (
            <p className="mt-4 text-sm text-green-700">{recommendation}</p>
          )}
        </div>
        {isInternal && (
          <button
            onClick={() => router.push("/dashboard/assessments")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Assessments
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border p-4">
          <p className="mb-2 font-medium">
            {idx + 1}. {q.text}
            {q.required && <span className="ml-1 text-red-500">*</span>}
          </p>

          {/* Text */}
          {(q.type === "text" || q.type === "textarea") && (
            q.type === "textarea" ? (
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )
          )}

          {/* Radio */}
          {q.type === "radio" && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    className="accent-blue-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {q.type === "checkbox" && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(answers[q.id] ?? []).includes(opt.value)}
                    onChange={() => toggleCheckbox(q.id, opt.value)}
                    className="accent-blue-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {/* Dropdown */}
          {q.type === "dropdown" && (
            <select
              value={answers[q.id] ?? ""}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select...</option>
              {q.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Assessment"}
        </button>
      </div>
    </form>
  );
}
