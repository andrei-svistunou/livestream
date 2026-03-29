"use client";

import { RoomMetadata } from "@/lib/controller";
import {
  ReceivedChatMessage,
  useChat,
  useLocalParticipant,
  useRoomInfo,
} from "@livekit/components-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ─── Username Color Assignment ───────────────────────────── */

const USERNAME_COLORS = [
  "#FF6B99", // Neon Pink (tertiary)
  "#00E3FD", // Neon Cyan (secondary)
  "#C19CFF", // Neon Purple (primary)
  "#6BCB77", // Neon Green
  "#FFD93D", // Neon Yellow
  "#FF8A65", // Neon Orange
  "#4DD0E1", // Teal
  "#BA68C8", // Violet
];

function getUsernameColor(identity: string): string {
  let hash = 0;
  for (let i = 0; i < identity.length; i++) {
    hash = identity.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USERNAME_COLORS[Math.abs(hash) % USERNAME_COLORS.length];
}

/* ─── Send Icon ───────────────────────────────────────────── */

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="var(--np-primary-dim)"
      stroke="none"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

/* ─── Chat Message ────────────────────────────────────────── */

function ChatMessage({ message }: { message: ReceivedChatMessage }) {
  const { localParticipant } = useLocalParticipant();
  const identity = message.from?.identity ?? "Unknown";
  const isLocal = localParticipant.identity === identity;

  const color = isLocal ? "var(--np-primary)" : getUsernameColor(identity);

  return (
    <div
      style={{
        padding: "2px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: isLocal ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          textAlign: isLocal ? "right" : "left",
          maxWidth: "90%",
          wordBreak: "break-word",
        }}
      >
        {!isLocal && (
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color,
              fontFamily: "var(--np-font-body)",
              marginRight: "6px",
            }}
          >
            {identity}
          </span>
        )}
        <span
          style={{
            fontSize: "1rem",
            color: "var(--np-on-surface)",
            fontFamily: "var(--np-font-body)",
          }}
        >
          {message.message}
        </span>
        {isLocal && (
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color,
              fontFamily: "var(--np-font-body)",
              marginLeft: "6px",
            }}
          >
            {identity}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Chat Component ──────────────────────────────────────── */

export function Chat({ onNewMessage }: { onNewMessage?: () => void }) {
  const [draft, setDraft] = useState("");
  const { chatMessages, send } = useChat();
  const { metadata } = useRoomInfo();
  const prevCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { enable_chat: chatEnabled } = (
    metadata ? JSON.parse(metadata) : {}
  ) as RoomMetadata;

  // Deduplicate messages
  const messages = useMemo(() => {
    const timestamps = chatMessages.map((msg) => msg.timestamp);
    const filtered = chatMessages.filter(
      (msg, i) => !timestamps.includes(msg.timestamp, i + 1),
    );
    return filtered;
  }, [chatMessages]);

  // Notify parent of new messages
  useEffect(() => {
    if (messages.length > prevCountRef.current && prevCountRef.current > 0) {
      onNewMessage?.();
    }
    prevCountRef.current = messages.length;
  }, [messages.length, onNewMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const onSend = async () => {
    if (draft.trim().length && send) {
      setDraft("");
      await send(draft);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "var(--np-font-body)",
      }}
    >
      {/* Messages Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: "8px",
          minHeight: 0,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--np-on-surface-variant)",
              fontSize: "0.8rem",
              padding: "24px 0",
              opacity: 0.6,
            }}
          >
            No messages yet. Say something!
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage message={msg} key={msg.timestamp} />
        ))}
      </div>

      {/* Input Area */}
      <div style={{ padding: "12px 20px 20px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#EBECF0",
            borderRadius: "24px",
            padding: "4px 6px 4px 16px",
            gap: "8px",
          }}
        >
          <input
            type="text"
            disabled={!chatEnabled}
            placeholder={chatEnabled ? "Type message..." : "Chat is disabled"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "0.875rem",
              color: "#1C2028",
              fontFamily: "var(--np-font-body)",
              padding: "8px 0",
            }}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!draft.trim().length}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: draft.trim().length
                ? "rgba(193, 156, 255, 0.15)"
                : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: draft.trim().length ? "pointer" : "default",
              transition: "background 0.2s ease",
              opacity: draft.trim().length ? 1 : 0.4,
              flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
