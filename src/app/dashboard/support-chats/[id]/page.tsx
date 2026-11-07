import Link from "next/link";
import { ArrowLeft, BookPlus } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Paged, SupportThread, ChatMessage } from "@/lib/types";
import { mintSupportChatWsToken } from "@/lib/actions/support-chats";
import { SupportChatPanel } from "@/components/support-chats/SupportChatPanel";

export const metadata = { title: "Support chat — Trickle Dash" };

// The bot's own messages use this fixed sender id (see transitorder's
// constants.SupportBotSenderID) — excluded here so "the admin's reply"
// never picks up a bot answer instead.
const SUPPORT_BOT_SENDER_ID = "trickle-support-bot";

function buildKnowledgeBaseLink(thread: SupportThread, messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((m) => m.senderId === thread.userId && m.text);
  const question = firstUserMessage?.text || thread.reasonLabel || thread.reason;
  const lastAdminMessage = [...messages].reverse().find((m) => m.senderId !== thread.userId && m.senderId !== SUPPORT_BOT_SENDER_ID && m.text);
  const answer = lastAdminMessage?.text || "";
  const params = new URLSearchParams({ question, answer, sourceThreadId: thread.id });
  return `/dashboard/knowledge-base/new?${params.toString()}`;
}

export default async function SupportChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [thread, messagesPage, wsToken] = await Promise.all([
    apiGet<SupportThread>(`/v1/admin/support-chats/${encodeURIComponent(id)}`),
    apiGet<Paged<ChatMessage>>(`/v1/admin/support-chats/${encodeURIComponent(id)}/messages`),
    mintSupportChatWsToken(id),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/support-chats" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} /> Back to support chats
        </Link>
        <Link
          href={buildKnowledgeBaseLink(thread, messagesPage.items)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-body text-sm text-ink hover:bg-surface-muted"
        >
          <BookPlus size={15} /> Add to Knowledge Base
        </Link>
      </div>

      <SupportChatPanel thread={thread} initialMessages={messagesPage.items} wsToken={wsToken} />
    </div>
  );
}
