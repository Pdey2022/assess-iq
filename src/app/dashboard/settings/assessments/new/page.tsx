"use client";

import { useRouter } from "next/navigation";
import AssessmentEditor from "../assessment-editor";

export default function NewAssessmentPage() {
  const router = useRouter();

  return (
    <AssessmentEditor
      onSave={async (data) => {
        const res = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create");
        router.push("/dashboard/settings/assessments");
        router.refresh();
      }}
    />
  );
}
