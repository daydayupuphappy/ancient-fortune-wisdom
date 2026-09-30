import type { Metadata } from "next";
import { ShareStudio } from "@/components/share/ShareStudio";

export const metadata: Metadata = {
  title: "Share your fortune card — Fortune Toss",
  description: "Turn today's hexagram into a portrait card for Stories, chats, and feeds.",
};

export default async function SharePage(props: PageProps<"/share">) {
  const { id } = await props.searchParams;
  return <ShareStudio readingId={typeof id === "string" ? id : undefined} />;
}
