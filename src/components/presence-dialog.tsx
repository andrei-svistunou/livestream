"use client";

import { ParticipantMetadata, RoomMetadata } from "@/lib/controller";
import {
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { Participant } from "livekit-client";
import { useAuthToken } from "./token-context";

/* ─── SVG Icons ───────────────────────────────────────────── */

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--np-secondary)" stroke="none">
      <path d="M2 20h20L19 9l-5 4-2-6-2 6-5-4z" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="var(--np-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-4 0v1" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

/* ─── Participant List Item ───────────────────────────────── */

function ParticipantListItem({
  participant,
  isCurrentUser,
  isHost = false,
}: {
  participant: Participant;
  isCurrentUser: boolean;
  isHost?: boolean;
}) {
  const authToken = useAuthToken();
  const participantMetadata: ParticipantMetadata = (() => {
    try {
      if (participant.metadata) {
        return JSON.parse(participant.metadata) as ParticipantMetadata;
      }
    } catch {
      // ignore
    }
    return {
      hand_raised: false,
      invited_to_stage: false,
      avatar_image: `https://api.multiavatar.com/${participant.identity}.png`,
    };
  })();
  const room = useRoomContext();
  const roomMetadata = (room.metadata &&
    JSON.parse(room.metadata)) as RoomMetadata;

  const onInvite = async () => {
    await fetch("/api/invite_to_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: participant.identity,
      }),
    });
  };

  const onRaiseHand = async () => {
    await fetch("/api/raise_hand", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
    });
  };

  const onCancel = async () => {
    await fetch("/api/remove_from_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: participant.identity,
      }),
    });
  };

  /* ─── Action Buttons ─────────────────────────────────────── */

  function HostActions() {
    if (!isCurrentUser) {
      if (
        participantMetadata.invited_to_stage &&
        participantMetadata.hand_raised
      ) {
        return (
          <button type="button" className="np-btn-ghost" onClick={onCancel}>
            Remove
          </button>
        );
      } else if (participantMetadata.hand_raised) {
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="np-btn-sm" onClick={onInvite}>
              Accept
            </button>
            <button type="button" className="np-btn-ghost" onClick={onCancel}>
              Reject
            </button>
          </div>
        );
      } else if (participantMetadata.invited_to_stage) {
        return (
          <button type="button" className="np-btn-ghost" style={{ opacity: 0.5, cursor: "default" }}>
            Pending
          </button>
        );
      } else if (!participantMetadata.invited_to_stage) {
        return (
          <button type="button" className="np-btn-sm" onClick={onInvite}>
            Invite to stage
          </button>
        );
      }
    }
  }

  function ViewerActions() {
    if (isCurrentUser) {
      if (
        participantMetadata.invited_to_stage &&
        participantMetadata.hand_raised
      ) {
        return (
          <button type="button" className="np-btn-ghost" onClick={onCancel}>
            Leave stage
          </button>
        );
      } else if (
        participantMetadata.invited_to_stage &&
        !participantMetadata.hand_raised
      ) {
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="np-btn-sm" onClick={onRaiseHand}>
              Accept
            </button>
            <button type="button" className="np-btn-ghost" onClick={onCancel}>
              Reject
            </button>
          </div>
        );
      } else if (
        !participantMetadata.invited_to_stage &&
        participantMetadata.hand_raised
      ) {
        return (
          <button type="button" className="np-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        );
      } else if (
        !participantMetadata.invited_to_stage &&
        !participantMetadata.hand_raised
      ) {
        return (
          <button type="button" className="np-btn-sm" onClick={onRaiseHand}>
            Raise hand
          </button>
        );
      }
    }
  }

  const isOnStage =
    participantMetadata.invited_to_stage && participantMetadata.hand_raised;

  return (
    <div className="np-presence-item" key={participant.sid}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "1rem",
            background: isCurrentUser
              ? "linear-gradient(135deg, var(--np-primary-dim), var(--np-primary))"
              : "var(--np-surface-container-highest)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {participantMetadata?.avatar_emoji ??
            participant.identity[0]?.toUpperCase() ?? (
              <PersonIcon />
            )}
          {/* On-stage indicator */}
          {isOnStage && (
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "var(--np-surface-container-high)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--np-secondary)",
                  boxShadow: "0 0 6px rgba(0, 227, 253, 0.5)",
                }}
              />
            </div>
          )}
        </div>

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              fontFamily: "var(--np-font-body)",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--np-on-surface)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {participant.identity}
            {isCurrentUser && (
              <span style={{ color: "var(--np-primary)", fontWeight: 400 }}>
                {" "}(you)
              </span>
            )}
          </span>
          {/* Status row */}
          {participantMetadata.hand_raised &&
            !participantMetadata.invited_to_stage && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.7rem",
                  color: "var(--np-tertiary)",
                  fontWeight: 600,
                  marginTop: "2px",
                }}
              >
                <HandIcon /> Raised hand
              </span>
            )}
        </div>
      </div>

      {/* Actions */}
      {isHost && roomMetadata?.allow_participation ? (
        <HostActions />
      ) : (
        <ViewerActions />
      )}
    </div>
  );
}

/* ─── Presence Panel (Controlled) ─────────────────────────── */

export function PresencePanel({
  isHost = false,
}: {
  isHost?: boolean;
}) {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const hosts = participants.filter(
    (participant) => participant.permissions?.canPublish ?? false,
  );
  const viewers = participants.filter(
    (participant) => !(participant.permissions?.canPublish ?? false),
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        padding: "0 20px 20px",
        overflowY: "auto",
        flex: 1,
      }}
    >
      {/* Hosts Section */}
      {hosts.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 0 12px",
              position: "sticky",
              top: 0,
              background: "var(--np-surface-container-high)",
              zIndex: 1,
            }}
          >
            <CrownIcon />
            <span className="np-label" style={{ fontSize: "0.65rem" }}>
              {hosts.length > 1 ? "Co-Hosts" : "Host"}
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--np-on-surface-variant)",
                fontWeight: 500,
              }}
            >
              {hosts.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {hosts.map((participant) => (
              <ParticipantListItem
                key={participant.identity}
                participant={participant}
                isCurrentUser={
                  participant.identity === localParticipant.identity
                }
                isHost={isHost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Viewers Section */}
      {viewers.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 0 12px",
              position: "sticky",
              top: 0,
              background: "var(--np-surface-container-high)",
              zIndex: 1,
            }}
          >
            <span className="np-label" style={{ fontSize: "0.65rem" }}>
              Viewers
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--np-on-surface-variant)",
                fontWeight: 500,
              }}
            >
              {viewers.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {viewers.map((participant) => (
              <ParticipantListItem
                key={participant.identity}
                participant={participant}
                isCurrentUser={
                  participant.identity === localParticipant.identity
                }
                isHost={isHost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {participants.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "48px 0",
            color: "var(--np-on-surface-variant)",
          }}
        >
          <PersonIcon />
          <span style={{ fontSize: "0.85rem" }}>No one here yet</span>
        </div>
      )}
    </div>
  );
}
