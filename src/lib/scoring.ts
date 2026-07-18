export type Question = {
  id: string;
  text: string;
  type: string;
  options?: { label: string; value: string }[];
};

export type ScoreResult = {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  breakdown: {
    questionId: string;
    questionText: string;
    answer: any;
    score: number;
    maxScore: number;
  }[];
  recommendation: string;
};

export function calculateScore(
  questions: Question[],
  answers: Record<string, any>,
  scoringLogic: Record<string, Record<string, number>>,
  knowledgeBase: { thresholds?: { min: number; max: number; recommendation: string }[] }
): ScoreResult {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const breakdown: ScoreResult["breakdown"] = [];

  for (const q of questions) {
    const answer = answers[q.id];
    const logic = scoringLogic[q.id] ?? {};

    let questionScore = 0;
    let questionMax = 0;

    if (q.type === "text" || q.type === "textarea") {
      // Text answers get no score
      questionScore = 0;
      questionMax = 0;
    } else {
      // Compute max possible for this question
      if (q.type === "checkbox") {
        // For checkboxes, max is sum of all positive option scores
        questionMax = Object.values(logic).reduce((sum, v) => {
          return typeof v === "number" && v > 0 ? sum + v : sum;
        }, 0);
      } else {
        // For radio/dropdown, max is the highest single option
        questionMax = Object.values(logic).reduce((sum, v) => {
          return typeof v === "number" ? Math.max(sum, v) : sum;
        }, 0);
      }

      if (answer) {
        if (Array.isArray(answer)) {
          for (const val of answer) {
            questionScore += logic[val] ?? 0;
          }
        } else {
          questionScore += logic[answer] ?? 0;
        }
      }
    }

    totalScore += questionScore;
    maxPossibleScore += questionMax;

    breakdown.push({
      questionId: q.id,
      questionText: q.text,
      answer: answer ?? "(not answered)",
      score: questionScore,
      maxScore: questionMax,
    });
  }

  const rawPct = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100)
    : 0;
  const percentage = Math.min(rawPct, 100);

  const recommendation = getRecommendation(percentage, knowledgeBase, questions, answers, scoringLogic);

  return { totalScore, maxPossibleScore, percentage, breakdown, recommendation };
}

function getRecommendation(
  percentage: number,
  knowledgeBase: { thresholds?: { min: number; max: number; recommendation: string }[] },
  questions: Question[],
  answers: Record<string, any>,
  scoringLogic: Record<string, Record<string, number>>
): string {
  // Build recommendation from thresholds
  const thresholds = knowledgeBase?.thresholds ?? [];
  for (const t of thresholds) {
    if (percentage >= t.min && percentage <= t.max) {
      let rec = t.recommendation;

      // Append poor-answer recommendations
      const poorAnswers: string[] = [];
      for (const q of questions) {
        const answer = answers[q.id];
        if (!answer) continue;
        const logic = scoringLogic[q.id];
        if (!logic) continue;

        if (Array.isArray(answer)) {
          for (const val of answer) {
            if ((logic[val] ?? 0) === 0) {
              const opt = q.options?.find((o) => o.value === val);
              poorAnswers.push(`"${q.text}" — selected "${opt?.label ?? val}" (0 pts)`);
            }
          }
        } else {
          if ((logic[answer] ?? 0) === 0) {
            const opt = q.options?.find((o) => o.value === answer);
            poorAnswers.push(`"${q.text}" — "${opt?.label ?? answer}" (0 pts)`);
          }
        }
      }

      if (poorAnswers.length > 0) {
        rec += `\n\nAreas to improve:\n• ${poorAnswers.join("\n• ")}`;
      }

      return rec;
    }
  }

  return "No recommendation available.";
}
