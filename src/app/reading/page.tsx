import { Suspense } from "react";
import { ReadingView } from "@/components/reading/ReadingView";

export default function ReadingPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-3xl px-6 py-20" />}>
      <ReadingView />
    </Suspense>
  );
}
