"use client";

import { useState } from "react";

export type Question = {
  id: string;
  text: string;
  type: "text" | "textarea" | "dropdown" | "radio" | "checkbox";
  required: boolean;
  options: { label: string; value: string }[];
};

export type AssessmentData = {
  title: string;
  description: string;
  questions: Question[];
  scoringLogic: Record<string, Record<string, number>>;
  knowledgeBase: {
    thresholds: { min: number; max: number; recommendation: string }[];
    poorAnswers: {
      questionId: string;
      answer: string;
      recommendation: string;
    }[];
  };
};

type Props = {
  initialData?: AssessmentData;
  onSave: (data: AssessmentData) => Promise<void>;
};

let qCounter = 0;
function newQuestion(): Question {
  qCounter++;
  return {
    id: `q_${Date.now()}_${qCounter}`,
    text: "",
    type: "radio",
    required: false,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
  };
}

const emptyKB = { thresholds: [], poorAnswers: [] };

export default function AssessmentEditor({ initialData, onSave }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions ?? [],
  );
  const [scoringLogic, setScoringLogic] = useState<
    Record<string, Record<string, number>>
  >(initialData?.scoringLogic ?? {});
  const [knowledgeBase, setKnowledgeBase] = useState(
    initialData?.knowledgeBase ?? emptyKB,
  );
  const [saving, setSaving] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, newQuestion()]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    const logic = { ...scoringLogic };
    delete logic[id];
    setScoringLogic(logic);
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  function addOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  label: `Option ${q.options.length + 1}`,
                  value: `option_${q.options.length + 1}`,
                },
              ],
            }
          : q,
      ),
    );
  }

  function updateOption(
    questionId: string,
    index: number,
    patch: Partial<{ label: string; value: string }>,
  ) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === index ? { ...opt, ...patch } : opt,
              ),
            }
          : q,
      ),
    );
  }

  function removeOption(questionId: string, index: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q,
      ),
    );
  }

  function setScore(questionId: string, optionValue: string, score: number) {
    setScoringLogic((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [optionValue]: score },
    }));
  }

  function addThreshold() {
    setKnowledgeBase((prev) => ({
      ...prev,
      thresholds: [
        ...prev.thresholds,
        { min: 0, max: 100, recommendation: "" },
      ],
    }));
  }

  function updateThreshold(
    index: number,
    patch: Partial<{ min: number; max: number; recommendation: string }>,
  ) {
    setKnowledgeBase((prev) => ({
      ...prev,
      thresholds: prev.thresholds.map((t, i) =>
        i === index ? { ...t, ...patch } : t,
      ),
    }));
  }

  function removeThreshold(index: number) {
    setKnowledgeBase((prev) => ({
      ...prev,
      thresholds: prev.thresholds.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        questions,
        scoringLogic,
        knowledgeBase,
      });
    } catch {
      alert("Failed to save assessment");
    } finally {
      setSaving(false);
    }
  }

  const questionTypes: { value: Question["type"]; label: string }[] = [
    { value: "text", label: "Text Input" },
    { value: "textarea", label: "Text Area" },
    { value: "dropdown", label: "Dropdown" },
    { value: "radio", label: "Radio Buttons" },
    { value: "checkbox", label: "Checkboxes" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assessment Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Security Audit"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of this assessment..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            + Add Question
          </button>
        </div>

        {questions.length === 0 && (
          <p className="text-sm text-gray-400">
            No questions yet. Click &quot;+ Add Question&quot; to start
            building.
          </p>
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Question {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              {/* Question text */}
              <input
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Enter your question..."
                className="mb-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {/* Question type + required */}
              <div className="mb-3 flex gap-4">
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      type: e.target.value as Question["type"],
                      options:
                        e.target.value === "text" ||
                        e.target.value === "textarea"
                          ? []
                          : q.options.length > 0
                            ? q.options
                            : [
                                { label: "Yes", value: "yes" },
                                { label: "No", value: "no" },
                              ],
                    })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {questionTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      updateQuestion(q.id, { required: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Required
                </label>
              </div>

              {/* Options (for dropdown/radio/checkbox) */}
              {(q.type === "dropdown" ||
                q.type === "radio" ||
                q.type === "checkbox") && (
                <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Options
                    </span>
                    <button
                      type="button"
                      onClick={() => addOption(q.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + Add Option
                    </button>
                  </div>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        value={opt.label}
                        onChange={(e) =>
                          updateOption(q.id, oi, {
                            label: e.target.value,
                            value: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          })
                        }
                        placeholder="Label"
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      {/* Score for this option */}
                      <input
                        type="number"
                        value={scoringLogic[q.id]?.[opt.value] ?? 0}
                        onChange={(e) =>
                          setScore(q.id, opt.value, Number(e.target.value))
                        }
                        placeholder="Score"
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        title="Point value for this option"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(q.id, oi)}
                        className="text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Base */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recommendation Thresholds</h2>
          <button
            type="button"
            onClick={addThreshold}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            + Add Threshold
          </button>
        </div>

        {knowledgeBase.thresholds.length === 0 && (
          <p className="mb-4 text-sm text-gray-400">
            Define score ranges and what recommendation to give for each.
          </p>
        )}

        <div className="space-y-3">
          {knowledgeBase.thresholds.map((t, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="flex gap-2">
                <input
                  type="number"
                  value={t.min}
                  onChange={(e) =>
                    updateThreshold(i, { min: Number(e.target.value) })
                  }
                  placeholder="Min"
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="pt-1 text-sm text-gray-400">to</span>
                <input
                  type="number"
                  value={t.max}
                  onChange={(e) =>
                    updateThreshold(i, { max: Number(e.target.value) })
                  }
                  placeholder="Max"
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                />
              </div>
              <input
                value={t.recommendation}
                onChange={(e) =>
                  updateThreshold(i, { recommendation: e.target.value })
                }
                placeholder="Recommendation text..."
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeThreshold(i)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end border-t pt-6">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-700 hover:to-primary-600 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Assessment"}
        </button>
      </div>
    </form>
  );
}
