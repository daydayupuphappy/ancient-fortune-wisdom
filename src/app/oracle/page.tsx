import { Suspense } from "react";
import type { Metadata } from "next";
import { OracleClient } from "@/components/oracle/OracleClient";

export const metadata: Metadata = {
  title: "Ask the Oracle · Fortune Toss",
  description: "Reflect on your hexagram with a question. Perspective, not predictions.",
};

export default function OraclePage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="eyebrow">Ask the Oracle</p>
        </section>
      }
    >
      <OracleClient />
    </Suspense>
  );
}
