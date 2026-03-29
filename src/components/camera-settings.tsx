"use client";

import { useLocalParticipant, useMediaDeviceSelect } from "@livekit/components-react";
import { useState, useEffect, useRef } from "react";

function CameraIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function CameraSettings({ onClose }: { onClose?: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [camEnabled, setCamEnabled] = useState(localParticipant.isCameraEnabled);

  useEffect(() => {
    setCamEnabled(localParticipant.isCameraEnabled);
  }, [localParticipant.isCameraEnabled]);

  const {
    devices: cameraDevices,
    activeDeviceId: activeCameraDeviceId,
    setActiveMediaDevice: setActiveCameraDevice,
  } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  const [previewDeviceId, setPreviewDeviceId] = useState<string | undefined>(activeCameraDeviceId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activeCameraDeviceId && !previewDeviceId) {
       setPreviewDeviceId(activeCameraDeviceId);
    }
  }, [activeCameraDeviceId, previewDeviceId]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const setupPreview = async () => {
      try {
         if (previewDeviceId) {
           stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: previewDeviceId } } });
           if (videoRef.current) {
             videoRef.current.srcObject = stream;
           }
         }
      } catch (e) {
         console.error("Failed to start preview", e);
      }
    };
    setupPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [previewDeviceId]);

  const handleAccept = () => {
     if (previewDeviceId && previewDeviceId !== activeCameraDeviceId) {
        setActiveCameraDevice(previewDeviceId, { exact: true });
     }
     if (onClose) onClose();
  };

  const handleCancel = () => {
     setPreviewDeviceId(activeCameraDeviceId);
     if (onClose) onClose();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "0 20px 20px",
        overflowY: "auto",
        flex: 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div
             style={{
               width: "36px",
               height: "36px",
               borderRadius: "1rem",
               background: camEnabled
                 ? "linear-gradient(135deg, var(--np-primary-dim), var(--np-primary))"
                 : "var(--np-surface-container-highest)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               color: "var(--np-on-surface)",
             }}
           >
             <CameraIcon off={!camEnabled} />
           </div>
           <span className="np-label" style={{ fontSize: "1rem" }}>Camera {camEnabled ? "On" : "Off"}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
             type="button" 
             className="np-btn-primary" 
             onClick={() => localParticipant.setCameraEnabled(true)}
             style={{ 
               width: "auto", 
               padding: "6px 12px",
               fontSize: "0.85rem",
               opacity: camEnabled ? 1 : 0.6,
               background: camEnabled ? "var(--np-primary)" : "var(--np-surface-container-highest)",
               color: camEnabled ? "var(--np-background)" : "var(--np-on-surface)"
             }}
          >
            On
          </button>
          <button 
             type="button" 
             className="np-btn-primary" 
             onClick={() => localParticipant.setCameraEnabled(false)}
             style={{ 
               width: "auto", 
               padding: "6px 12px",
               fontSize: "0.85rem",
               opacity: !camEnabled ? 1 : 0.6,
               background: !camEnabled ? "#FF4444" : "var(--np-surface-container-highest)",
               color: !camEnabled ? "#FFF" : "var(--np-on-surface)"
             }}
          >
            Off
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span className="np-label" style={{ fontSize: "0.85rem", color: "var(--np-on-surface-variant)" }}>
          Preview
        </span>
        <div style={{ 
          width: "100%", 
          height: "180px", 
          borderRadius: "16px", 
          overflow: "hidden", 
          background: "var(--np-surface-container)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          {previewDeviceId ? (
            <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          ) : (
             <span style={{ color: "var(--np-on-surface-variant)" }}>No camera selected</span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span className="np-label" style={{ fontSize: "0.85rem", color: "var(--np-on-surface-variant)" }}>
          Select Camera
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {cameraDevices.map((d) => (
            <div
              key={d.deviceId}
              className="np-presence-item"
              onClick={() => setPreviewDeviceId(d.deviceId)}
              style={{
                cursor: "pointer",
                background: d.deviceId === previewDeviceId ? "rgba(0, 227, 253, 0.05)" : "transparent",
                border: d.deviceId === previewDeviceId ? "1px solid rgba(0, 227, 253, 0.2)" : "1px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "var(--np-font-body)",
                    fontSize: "0.9rem",
                    fontWeight: d.deviceId === previewDeviceId ? 600 : 400,
                    color: d.deviceId === previewDeviceId ? "var(--np-primary)" : "var(--np-on-surface)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                </span>
              </div>
            </div>
          ))}
          {cameraDevices.length === 0 && (
             <div style={{ padding: "12px", textAlign: "center", color: "var(--np-on-surface-variant)", fontSize: "0.85rem" }}>
                No cameras found
             </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
         <button type="button" className="np-btn-ghost" onClick={handleCancel} style={{ flex: 1 }}>
           Cancel
         </button>
         <button type="button" className="np-btn-primary" onClick={handleAccept} style={{ flex: 1 }}>
           Accept
         </button>
      </div>
    </div>
  );
}
