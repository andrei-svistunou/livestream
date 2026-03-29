"use client";

import { Chat } from "@/components/chat";
import { PresencePanel } from "@/components/presence-dialog";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { cn } from "@/lib/utils";
import { LiveKitRoom, useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react";
import { useCallback, useRef, useState } from "react";
import { ConnectionState } from "livekit-client";
import { useCopyToClipboard } from "@/lib/clipboard";

/* ─── SVG Icons ───────────────────────────────────────────── */

function ChatIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={active ? "var(--np-primary)" : "currentColor"}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MicIcon({ muted }: { muted?: boolean }) {
  if (muted) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .88-.16 1.73-.46 2.5" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function CameraIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

/* ─── Bottom Navigation Bar ───────────────────────────────── */

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
      className="np-bottom-nav-item"
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

/* ─── Inner Host Content (needs LiveKit context) ──────────── */

function HostContent({ isHost }: { isHost: boolean }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [_, copy] = useCopyToClipboard();
  const streamAreaRef = useRef<HTMLDivElement>(null);

  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const room = useRoomContext();
  const { name: roomName, state: roomState } = room;

  const handleNewMessage = useCallback(() => {
    if (!chatOpen) {
      setUnreadCount((c) => c + 1);
    }
  }, [chatOpen]);

  const handleOpenChat = () => {
    if (chatOpen) {
      setChatOpen(false);
    } else {
      setChatOpen(true);
      setUnreadCount(0);
    }
  };

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(
      !localParticipant.isMicrophoneEnabled,
    );
  };

  const toggleCamera = () => {
    localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
  };

  const copyLink = () => {
    if (roomName) {
      copy(`${window.location.origin}/watch/${roomName}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const onLeave = async () => {
    try {
      if (isHost) {
        await fetch("/api/stop_stream", {
          method: "POST",
          headers: {
            Authorization: `Token ${(window as any).__authToken || ""}`,
          },
        });
      }
    } catch {
      // ignore
    }
    room.disconnect();
    window.location.href = "/admin";
  };

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

  return (
    <div className="fixed inset-0 w-full overflow-hidden" style={{ height: "100dvh", background: "var(--np-background)" }}>
    {/* <div className="relative w-full overflow-hidden" style={{ height: "100vh", background: "var(--np-background)" }}> */}
      {/* Video Area — full screen */}
      <div ref={streamAreaRef} className="w-full h-full">
        <StreamPlayer isHost={isHost} />
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

      {/* Link copied toast */}
      {linkCopied && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 20px",
            borderRadius: "0.75rem",
            background: "rgba(0, 227, 253, 0.15)",
            border: "1px solid rgba(0, 227, 253, 0.3)",
            color: "var(--np-secondary)",
            fontSize: "0.8rem",
            fontWeight: 600,
            fontFamily: "var(--np-font-body)",
            zIndex: 50,
            backdropFilter: "blur(12px)",
          }}
        >
          Link copied!
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
        <button
          type="button"
          onClick={copyLink}
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--np-on-surface)",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
          }}
          title="Copy Link"
        >
          <LinkIcon />
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
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(4px, 2vw, 8px)",
          padding: "16px 12px 32px",
          background: "linear-gradient(to top, rgba(11, 14, 20, 0.95) 0%, rgba(11, 14, 20, 0.8) 50%, transparent 100%)",
          zIndex: 20,
        }}
      >
        <BottomNavItem
          icon={<ChatIcon active={chatOpen} />}
          label="Chat"
          onClick={handleOpenChat}
          active={chatOpen}
          badge={!chatOpen && unreadCount > 0}
        />
        <BottomNavItem
          icon={<MicIcon muted={!localParticipant.isMicrophoneEnabled} />}
          label="Mic"
          onClick={toggleMic}
          active={localParticipant.isMicrophoneEnabled}
        />
        <BottomNavItem
          icon={<CameraIcon off={!localParticipant.isCameraEnabled} />}
          label="Camera"
          onClick={toggleCamera}
          active={localParticipant.isCameraEnabled}
        />
        <BottomNavItem
          icon={<UsersIcon />}
          label={roomState === ConnectionState.Connected ? `${participants.length}` : "Viewers"}
          onClick={() => { setViewersOpen(true); setChatOpen(false); }}
          active={viewersOpen}
          badge={participants.some((p) => {
            try {
              const meta = p.metadata && JSON.parse(p.metadata);
              return meta?.hand_raised && !meta?.invited_to_stage;
            } catch { return false; }
          })}
        />
        <BottomNavItem
          icon={<LeaveIcon />}
          label="Leave"
          onClick={onLeave}
          danger
        />
      </div>

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
        <PresencePanel isHost={isHost} />
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

/* ─── Main Export ──────────────────────────────────────────── */

export default function HostPage({
  authToken,
  roomToken,
  serverUrl,
}: {
  authToken: string;
  roomToken: string;
  serverUrl: string;
}) {
  // Store auth token globally for the leave handler
  if (typeof window !== "undefined") {
    (window as any).__authToken = authToken;
  }

  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
        <HostContent isHost={true} />
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
