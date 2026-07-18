"use client";

import AssessmentForm from "@/app/components/assessment-form";
import { useRouter } from "next/navigation";

export default function PublicAssessmentForm(props: any) {
  const router = useRouter();

  return (
    <AssessmentForm
      {...props}
      onComplete={() => {
        router.push("/assess/thank-you");
      }}
    />
  );
}
