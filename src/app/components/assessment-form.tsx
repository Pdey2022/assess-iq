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
  const [result, setResult] = useState<any>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const url = token
      ? `/api/assess-by-token/${token}`
      : `/api/submissions/${submissionId}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, status: "COMPLETED" }),
    });

    const data = await res.json();
    setResult(data.recommendationReport);
    setSubmitted(true);
    setSubmitting(false);

    if (onComplete) onComplete();
  }

  if (submitted) {
    const score = result?.score ?? 0;
    const maxScore = result?.maxScore ?? 0;
    const pct = result?.percentage ?? 0;
    const rec = result?.recommendation ?? "";
    const breakdown = result?.breakdown ?? [];

    const getBarColor = (p: number) =>
      p >= 70 ? "bg-green-500" : p >= 40 ? "bg-yellow-500" : "bg-red-500";

    return (
      <div className="space-y-6">
        {/* Score Card */}
        <div className="rounded-lg border p-6 text-center">
          <h2 className="text-xl font-bold">Assessment Results</h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-5xl font-bold">{score}</span>
            <span className="text-xl text-gray-400">/ {maxScore}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{pct}% overall</p>
          <div className="mx-auto mt-3 h-3 w-full max-w-xs rounded-full bg-gray-200">
            <div
              className={`h-3 rounded-full ${getBarColor(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Recommendation */}
        {rec && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm whitespace-pre-line">
            <strong>Recommendation:</strong>
            <p className="mt-1 text-blue-800">{rec}</p>
          </div>
        )}

        {/* Per-Question Breakdown */}
        <div>
          <h3 className="mb-3 font-semibold">Question Breakdown</h3>
          <div className="space-y-2">
            {breakdown.map((b: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {i + 1}. {b.questionText}
                  </p>
                  <p className="text-xs text-gray-500">
                    Answer: {b.answer}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <span className="text-sm font-semibold">
                    {b.score} / {b.maxScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isInternal && (
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/dashboard/assessments")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Assessments
            </button>
          </div>
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
          {(q.type === "text" || q.type === "textarea") &&
            (q.type === "textarea" ? (
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
            ))}

          {/* Radio */}
          {q.type === "radio" && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm"
                >
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
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm"
                >
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
