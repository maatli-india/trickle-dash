"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, SupportThread } from "@/lib/types";
import { mintSupportChatWsToken, updateSupportChatStatusAction } from "@/lib/actions/support-chats";
import { Badge } from "@/components/Badge";
import { formatDateTime } from "@/lib/format";

// NEXT_PUBLIC_ so it's inlined into the client bundle — the websocket is
// opened directly from the browser, unlike every other backend call in this
// repo which goes through the server-only apiGet/apiPost client in api.ts.
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || "";

const STATUS_TONE = { open: "danger", resolved: "success", closed: "neutral" } as const;

type ConnectionState = "connecting" | "connected" | "disconnected";

type ServerFrame =
  | { event: "history"; payload: ChatMessage[] }
  | { event: "connected" }
  | { event: "message"; payload: ChatMessage }
  | { event: string; payload?: unknown };

export function SupportChatPanel({
  thread,
  initialMessages,
  wsToken,
}: {
  thread: SupportThread;
  initialMessages: ChatMessage[];
  wsToken: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [draft, setDraft] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [actionState, formAction, isUpdating] = useActionState(updateSupportChatStatusAction, undefined);

  // Deliberately doesn't set connectionState("connecting") here — this is
  // called directly from the mount effect below, and setState shouldn't be
  // called synchronously from an effect body. The initial useState value
  // already covers "connecting" on mount; retry() (a click handler, not an
  // effect) sets it explicitly before reconnecting.
  const connect = useCallback(
    (token: string) => {
      const socket = new WebSocket(`${WS_BASE_URL}/v1/admin/support-chats/${thread.id}/ws?access_token=${token}`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        let frame: ServerFrame;
        try {
          frame = JSON.parse(event.data);
        } catch {
          return;
        }
        if (frame.event === "history") {
          setMessages((frame.payload as ChatMessage[]) ?? []);
        } else if (frame.event === "connected") {
          setConnectionState("connected");
        } else if (frame.event === "message") {
          setMessages((prev) => [...prev, frame.payload as ChatMessage]);
        }
      };
      socket.onerror = () => setConnectionState("disconnected");
      socket.onclose = () => setConnectionState("disconnected");
    },
    [thread.id],
  );

  // Connect once on mount with the token minted server-side just before this
  // page rendered. Deliberately not re-running on `connect` identity changes —
  // thread.id is stable for the life of this page; reconnects after that are
  // only ever the explicit "retry" below (no auto-reconnect/backoff for v1).
  useEffect(() => {
    connect(wsToken);
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const retry = async () => {
    socketRef.current?.close();
    setConnectionState("connecting");
    // Never reuse a ws token — mint a fresh one right before each connect.
    const freshToken = await mintSupportChatWsToken(thread.id);
    connect(freshToken);
  };

  // Event name is "support_message", not "message" — the support-chat and
  // parcel-match chat features share one socket server with a single
  // global per-event-name handler table on the backend, so "message" would
  // collide with the existing chat feature's handler. Server->client
  // frames (history/message/connected) are unaffected, only client->server
  // sends need the "support_" prefix.
  const send = () => {
    const text = draft.trim();
    if (!text || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ event: "support_message", payload: { type: "text", text } }));
    setDraft("");
  };

  const textMessages = messages.filter((message) => message.type === "text");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{thread.reasonLabel}</h1>
            <p className="mt-1 font-body text-xs text-muted">
              User {thread.userId}
              {thread.role ? ` · ${thread.role}` : ""}
              {thread.matchId ? ` · match ${thread.matchId}` : ""}
            </p>
          </div>
          <Badge tone={STATUS_TONE[thread.status]}>{thread.status}</Badge>
        </div>
        <p className="mt-3 font-body text-xs text-muted">
          Opened {formatDateTime(thread.createdAt)}
          {thread.resolvedAt ? ` · resolved ${formatDateTime(thread.resolvedAt)}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <h2 className="font-display text-base font-semibold text-ink">Transcript</h2>
          {connectionState === "connected" ? (
            <span className="inline-flex items-center gap-1.5 font-body text-xs text-success">
              <span className="size-1.5 rounded-full bg-success" /> Live
            </span>
          ) : connectionState === "connecting" ? (
            <span className="font-body text-xs text-muted">Connecting…</span>
          ) : (
            <button type="button" onClick={retry} className="font-body text-xs font-medium text-danger hover:underline">
              Disconnected — retry
            </button>
          )}
        </div>

        <div ref={transcriptRef} className="max-h-[28rem] space-y-3 overflow-y-auto px-6 py-4">
          {textMessages.length === 0 ? (
            <p className="font-body text-sm text-muted">No messages yet.</p>
          ) : (
            textMessages.map((message) => {
              const fromUser = message.senderId === thread.userId;
              return (
                <div key={message.id} className={`flex ${fromUser ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[75%] rounded-xl px-3.5 py-2 font-body text-sm ${fromUser ? "bg-surface-muted text-ink" : "bg-accent-surface text-ink"}`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className="mt-1 font-body text-[10px] text-muted">{formatDateTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Reply…"
            className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={send}
            disabled={connectionState !== "connected" || !draft.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 font-body text-sm font-medium text-accent-ink hover:brightness-95 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>

      {thread.status === "open" ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Close this chat</h2>
          <form action={formAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={thread.id} />
            {actionState?.error ? <p className="w-full font-body text-sm text-danger">{actionState.error}</p> : null}
            {actionState?.success ? <p className="w-full font-body text-sm text-success">Saved.</p> : null}
            <button
              type="submit"
              name="status"
              value="resolved"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink transition-colors hover:brightness-95 disabled:opacity-60"
            >
              {isUpdating ? "Saving..." : "Resolve"}
            </button>
            <button
              type="submit"
              name="status"
              value="closed"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:opacity-60"
            >
              {isUpdating ? "Saving..." : "Close"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
