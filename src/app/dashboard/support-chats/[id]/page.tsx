import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Paged, SupportThread, ChatMessage } from "@/lib/types";
import { mintSupportChatWsToken } from "@/lib/actions/support-chats";
import { SupportChatPanel } from "@/components/support-chats/SupportChatPanel";

export const metadata = { title: "Support chat — Trickle Dash" };

export default async function SupportChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [thread, messagesPage, wsToken] = await Promise.all([
    apiGet<SupportThread>(`/v1/admin/support-chats/${encodeURIComponent(id)}`),
    apiGet<Paged<ChatMessage>>(`/v1/admin/support-chats/${encodeURIComponent(id)}/messages`),
    mintSupportChatWsToken(id),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/support-chats" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to support chats
      </Link>

      <SupportChatPanel thread={thread} initialMessages={messagesPage.items} wsToken={wsToken} />
    </div>
  );
}
