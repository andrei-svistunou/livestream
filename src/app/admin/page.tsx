"use client";

import { CreateStreamResponse } from "@/lib/controller";
import { useRouter } from "next/navigation";
import { useState } from "react";

function BroadcastIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3 14 21" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [roomName, setRoomName] = useState("");
  const [name, setName] = useState("");
  const [enableChat, setEnableChat] = useState(true);
  const [allowParticipation, setAllowParticipation] = useState(true);
  const [loading, setLoading] = useState(false);

  const onGoLive = async () => {
    setLoading(true);
    const res = await fetch("/api/create_stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_name: roomName,
        metadata: {
          creator_identity: name,
          enable_chat: enableChat,
          allow_participation: allowParticipation,
        },
      }),
    });
    const {
      auth_token,
      connection_details: { token },
    } = (await res.json()) as CreateStreamResponse;
    router.push(`/host?&at=${auth_token}&rt=${token}`);
  };

  return (
    <div className="np-page">
      <div className="np-card">
        {/* Header Bar */}
        {/* <div className="np-header-bar animate-fade-in-up">
          <div className="np-header-brand">
            <div className="np-header-avatar">🎙️</div>
            <span
              style={{
                fontFamily: "var(--np-font-display)",
                fontWeight: 600,
                fontSize: "1rem",
                color: "var(--np-on-surface)",
              }}
            >
              Live Studio
            </span>
          </div>
          <div style={{ color: "var(--np-on-surface-variant)" }}>
            <BroadcastIcon size={22} />
          </div>
        </div> */}
<div className="animate-fade-in-up-delay-2 flex justify-center">
  <img src="/logo_camera.svg"  width={100} height={100} alt="Logo" />
</div>
        {/* Title & Subtitle */}
        <div className="np-header-bar animate-fade-in-up">
          <h1
            className="np-title"
            style={{ fontSize: "2rem", marginBottom: "8px" }}
          >
            Stream
            <br />
            Configuration
          </h1>
          <div style={{ color: "var(--np-on-surface-variant)" }}>
            <BroadcastIcon size={44} />
          </div>
        </div>

        {/* ROOM NAME */}
        <div className="animate-fade-in-up-delay-2">
          <label
            className="np-label"
            style={{ marginBottom: "8px", display: "block" }}
          >
            Room Name
          </label>
          <div className="np-input-wrapper">
            <input
              id="admin-room-name"
              type="text"
              className="np-input"
              placeholder="e.g. Midnight Beats & Coding"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <span className="np-input-icon">
              <HashIcon />
            </span>
          </div>
        </div>

        {/* YOUR NAME */}
        <div className="animate-fade-in-up-delay-2">
          <label
            className="np-label"
            style={{ marginBottom: "8px", display: "block" }}
          >
            Your Name
          </label>
          <div className="np-input-wrapper">
            <input
              id="admin-display-name"
              type="text"
              className="np-input"
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <span className="np-input-icon">
              <UserIcon />
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div
          className="animate-fade-in-up-delay-3"
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {/* Enable Chat */}
          <div className="np-toggle-row">
            <div className="np-toggle-info">
              <div className="np-toggle-icon">
                <ChatIcon />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--np-on-surface)",
                    marginBottom: "2px",
                  }}
                >
                  Enable Chat
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--np-on-surface-variant)",
                  }}
                >
                  Real-time viewer interaction
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`np-toggle ${enableChat ? "active" : ""}`}
              onClick={() => setEnableChat(!enableChat)}
              aria-label="Toggle chat"
            />
          </div>

          {/* Allow Participation */}
          <div className="np-toggle-row">
            <div className="np-toggle-info">
              <div className="np-toggle-icon">
                <UsersIcon />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--np-on-surface)",
                    marginBottom: "2px",
                  }}
                >
                  Allow Joiners to Participate
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--np-on-surface-variant)",
                  }}
                >
                  Let guests share their mic/camera
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`np-toggle ${allowParticipation ? "active" : ""}`}
              onClick={() => setAllowParticipation(!allowParticipation)}
              aria-label="Toggle participation"
            />
          </div>
        </div>

        {/* START STREAM Button */}
        <div className="animate-fade-in-up-delay-4">
          <button
            id="start-stream-btn"
            className="np-btn-primary"
            disabled={!(roomName && name) || loading}
            onClick={onGoLive}
            type="button"
          >
            {loading ? "Starting..." : "START STREAM"}
            {!loading && <ArrowRight />}
          </button>
        </div>

      </div>
    </div>
  );
}
