"use client";

import { useRouter } from "next/navigation";
import AssessmentEditor, { AssessmentData } from "../assessment-editor";

export default function EditAssessmentClient({
  id,
  initialData,
}: {
  id: string;
  initialData: AssessmentData;
}) {
  const router = useRouter();

  return (
    <AssessmentEditor
      initialData={initialData}
      onSave={async (data) => {
        const res = await fetch(`/api/assessments/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update");
        router.push("/dashboard/settings/assessments");
        router.refresh();
      }}
    />
  );
}
