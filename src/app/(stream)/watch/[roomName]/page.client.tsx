"use client";

import { Chat } from "@/components/chat";
import { PresencePanel } from "@/components/presence-dialog";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { cn } from "@/lib/utils";
import { ConnectionState } from "livekit-client";
import { LiveKitRoom, useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { JoinStreamResponse } from "@/lib/controller";

const AVATARS = [
  { emoji: "🐙", label: "Octopus" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🤖", label: "Robot" },
  { emoji: "⚡", label: "Lightning" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "✨", label: "Sparkles" },
  { emoji: "👾", label: "Alien" },
  { emoji: "🎭", label: "Theater" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🎬", label: "Cinema" },
];

type PageState = "checking" | "not_active" | "join_form" | "connected";

/* ─── SVG Icons ───────────────────────────────────────────── */

function BroadcastIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChatNavIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={active ? "var(--np-primary)" : "currentColor"}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LeaveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UsersNavIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={active ? "var(--np-primary)" : "currentColor"}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function PipIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={active ? "var(--np-primary)" : "currentColor"}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <rect x="12" y="9" width="8" height="6" rx="1" fill={active ? "var(--np-primary)" : "none"} />
      <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  );
}
/* ─── Bottom Nav Item ─────────────────────────────────────── */

function BottomNavItem({
  icon,
  label,
  onClick,
  active,
  danger,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "8px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: danger
          ? "#FF6B6B"
          : active
            ? "var(--np-primary)"
            : "var(--np-on-surface-variant)",
        transition: "color 0.2s ease",
        position: "relative",
        fontFamily: "var(--np-font-body)",
      }}
    >
      <div style={{ position: "relative" }}>
        {icon}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: "-3px",
              right: "-3px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--np-tertiary)",
              boxShadow: "0 0 6px rgba(255, 107, 153, 0.6)",
            }}
          />
        )}
      </div>
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Stream View (Connected) ─────────────────────────────── */

function ViewerContent() {
  const [chatOpen, setChatOpen] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const { name: roomName, state: roomState } = room;
const streamAreaRef = useRef<HTMLDivElement>(null);
  const handleNewMessage = useCallback(() => {
    if (!chatOpen) {
      setUnreadCount((c) => c + 1);
    }
  }, [chatOpen]);
 const [pipActive, setPipActive] = useState(false);
 const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
      } else if (streamAreaRef.current) {
        const videos = streamAreaRef.current.querySelectorAll("video");
        const video = videos[videos.length - 1] || videos[0];
        if (video && document.pictureInPictureEnabled) {
          await video.requestPictureInPicture();
          setPipActive(true);
          video.addEventListener(
            "leavepictureinpicture",
            () => setPipActive(false),
            { once: true },
          );
        }
      }
    } catch {
      // PiP might not be supported
    }
  };
  const handleOpenChat = () => {
    if (chatOpen) {
      setChatOpen(false);
    } else {
      setChatOpen(true);
      setUnreadCount(0);
    }
  };

  const onLeave = () => {
    room.disconnect();
    router.push("/");
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100dvh", background: "var(--np-background)" }}>
      {/* Video Area — full screen */}
      <div ref={streamAreaRef} className="w-full h-full">
        <StreamPlayer />
      </div>

      {/* LIVE badge */}
      {roomState === ConnectionState.Connected && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "0.5rem",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(12px)",
            zIndex: 15,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#FF4444",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--np-on-surface)",
              fontFamily: "var(--np-font-body)",
            }}
          >
            Live
          </span>
        </div>
      )}

      {/* Top Right Controls */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "12px",
          zIndex: 15,
        }}
      >
        <button
          type="button"
          onClick={togglePiP}
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: pipActive ? "var(--np-primary)" : "var(--np-on-surface)",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
          }}
          title="Picture-in-Picture"
        >
          <PipIcon active={pipActive} />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(12px, 4vw, 24px)",
          padding: "16px 16px 32px",
          background: "linear-gradient(to top, rgba(11, 14, 20, 0.95), transparent)",
          zIndex: 20,
        }}
      >
        <BottomNavItem
          icon={<ChatNavIcon active={chatOpen} />}
          label="Chat"
          onClick={() => { handleOpenChat(); setViewersOpen(false); }}
          active={chatOpen}
          badge={!chatOpen && unreadCount > 0}
        />
        <BottomNavItem
          icon={<UsersNavIcon active={viewersOpen} />}
          label={`${participants.length}`}
          onClick={() => { setViewersOpen(!viewersOpen); setChatOpen(false); }}
          active={viewersOpen}
          badge={(() => {
            try {
              const meta = localParticipant.metadata && JSON.parse(localParticipant.metadata);
              return meta?.invited_to_stage && !meta?.hand_raised;
            } catch { return false; }
          })()}
        />
        <BottomNavItem
          icon={<LeaveIcon />}
          label="Leave"
          onClick={onLeave}
          danger
        />
      </div>

      {/* Bottom Sheet Overlay (backdrop) */}
      {(chatOpen || viewersOpen) && (
        <div
          onClick={() => { setChatOpen(false); setViewersOpen(false); }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            zIndex: 25,
          }}
        />
      )}

      {/* Who's Here Bottom Sheet */}
      <div
        className={cn(
          "transition-transform duration-300 ease-out",
          viewersOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55vh",
          background: "var(--np-surface-container-high)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--np-font-display)",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--np-primary)",
            }}
          >
            Who&rsquo;s Here
          </span>
          <button
            type="button"
            onClick={() => setViewersOpen(false)}
            style={{
              background: "var(--np-surface-container-highest)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--np-on-surface-variant)",
              transition: "background 0.2s ease",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <PresencePanel isHost={false} />
      </div>

      {/* Chat Bottom Sheet */}
      <div
        className={cn(
          "transition-transform duration-300 ease-out",
          chatOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55vh",
          background: "var(--np-surface-container-high)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--np-font-display)",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--np-primary)",
            }}
          >
            Chat
          </span>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            style={{
              background: "var(--np-surface-container-highest)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--np-on-surface-variant)",
              transition: "background 0.2s ease",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Chat Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Chat onNewMessage={handleNewMessage} />
        </div>
      </div>
    </div>
  );
}

function StreamView({
  serverUrl,
  roomToken,
  authToken,
}: {
  serverUrl: string;
  roomToken: string;
  authToken: string;
}) {
  const router = useRouter();

  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={roomToken}
        onDisconnected={() => router.push("/")}
      >
        <ViewerContent />
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}

/* ─── Main Watch Page ─────────────────────────────────────── */

export default function WatchPage({
  roomName,
  serverUrl,
}: {
  roomName: string;
  serverUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [authToken, setAuthToken] = useState("");
  const [roomToken, setRoomToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("checking");
  const [error, setError] = useState("");

  const checkStream = useCallback(async () => {
    setPageState("checking");
    try {
      const res = await fetch(
        `/api/check_stream?room_name=${encodeURIComponent(roomName)}`,
      );
      const data = await res.json();
      setPageState(data.active ? "join_form" : "not_active");
    } catch {
      setPageState("not_active");
    }
  }, [roomName]);

  useEffect(() => {
    checkStream();
  }, [checkStream]);

  const onJoin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/join_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_name: roomName,
          identity: name,
          avatar_emoji: AVATARS[selectedAvatar].emoji,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to join stream");
      }

      const {
        auth_token,
        connection_details: { token },
      } = (await res.json()) as JoinStreamResponse;

      setAuthToken(auth_token);
      setRoomToken(token);
      setPageState("connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join");
      setLoading(false);
    }
  };

  // ── Connected: show stream ──
  if (pageState === "connected" && authToken && roomToken) {
    return (
      <StreamView
        serverUrl={serverUrl}
        roomToken={roomToken}
        authToken={authToken}
      />
    );
  }

  // ── Checking: loading spinner ──
  if (pageState === "checking") {
    return (
      <div className="np-page">
        <div className="np-card" style={{ alignItems: "center", gap: "16px" }}>
          <div className="np-broadcast-icon animate-fade-in-up">
            <BroadcastIcon />
          </div>
          <Spinner />
          <p className="np-subtitle animate-fade-in-up-delay-1" style={{ textAlign: "center" }}>
            Checking stream status...
          </p>
        </div>
      </div>
    );
  }

  // ── Not active: stream unavailable ──
  if (pageState === "not_active") {
    return (
      <div className="np-page">
        <div className="np-card animate-fade-in-up" style={{ alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>📡</div>
          <h2 className="np-title" style={{ fontSize: "1.75rem" }}>
            Stream not available
          </h2>
          <p className="np-subtitle">
            The stream &quot;{decodeURI(roomName)}&quot; hasn&apos;t started yet
            or has ended.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={() => router.push("/")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 20px",
                background: "var(--np-surface-container-high)",
                color: "var(--np-on-surface)",
                border: "1px solid rgba(69, 72, 79, 0.15)",
                borderRadius: "0.75rem",
                fontFamily: "var(--np-font-body)",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <HomeIcon /> Go home
            </button>
            <button
              type="button"
              onClick={checkStream}
              className="np-btn-primary"
              style={{ width: "auto", padding: "12px 20px", fontSize: "0.875rem" }}
            >
              <RefreshIcon /> Check again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Join form ──
  return (
    <div className="np-page">
      <div className="np-card">
        {/* Broadcast Icon */}
        <div className="animate-fade-in-up" style={{ textAlign: "center" }}>
          <div className="np-broadcast-icon">
            {/* <BroadcastIcon /> */}
  <img src="/logo.svg"  width={100} height={100} alt="Logo" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="animate-fade-in-up-delay-1" style={{ textAlign: "center" }}>
          <h1 className="np-title" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
            {decodeURI(roomName)}
          </h1>
          <p className="np-subtitle">
            Set your name and pick an
            avatar.
          </p>
        </div>

        {/* YOUR NAME */}
        <div className="animate-fade-in-up-delay-2">
          <label className="np-label" style={{ marginBottom: "8px", display: "block" }}>
            Your Name
          </label>
          <div className="np-input-wrapper">
            <input
              id="display-name-input"
              type="text"
              className="np-input"
              placeholder="Enter your display name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter" && name) {
                  onJoin();
                }
              }}
            />
            <span className="np-input-icon">
              <UserIcon />
            </span>
          </div>
        </div>

        {/* SELECT AVATAR */}
        <div className="animate-fade-in-up-delay-3">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "12px",
            }}
          >
            <span className="np-label">Select Avatar</span>
            <span style={{ fontSize: "0.8rem", color: "var(--np-on-surface-variant)" }}>
              Pick your vibe
            </span>
          </div>
          <div className="np-avatar-grid">
            {AVATARS.map((avatar, idx) => (
              <button
                key={avatar.label}
                id={`avatar-${idx}`}
                className={`np-avatar-item ${selectedAvatar === idx ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(idx)}
                title={avatar.label}
                type="button"
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(255, 9, 125, 0.15)",
              borderLeft: "4px solid var(--np-tertiary)",
              borderRadius: "0.5rem",
              color: "var(--np-tertiary)",
              fontSize: "0.875rem",
              fontFamily: "var(--np-font-body)",
            }}
          >
            {error}
          </div>
        )}

        {/* JOIN BUTTON */}
        <div className="animate-fade-in-up-delay-4">
          <button
            id="join-stream-btn"
            className="np-btn-primary"
            disabled={!name.trim() || loading}
            onClick={onJoin}
            type="button"
          >
            {loading ? "Joining..." : "Join Stream"}
            {!loading && <ArrowRight />}
          </button>
        </div>

        {/* Footer decoration */}
        {/* <div className="np-footer-bar" /> */}
      </div>
    </div>
  );
}
