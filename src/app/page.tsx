import React from "react";

export default function HomePage() {
  return (
    <div className="np-page">
      <div className="np-card animate-fade-in-up" style={{ alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👋</div>
        <h2 className="np-title" style={{ fontSize: "2rem", marginBottom: "12px" }}>
          Thank you for watching!
        </h2>
        <p className="np-subtitle" style={{ fontSize: "1.1rem", marginBottom: "24px", color: "var(--np-on-surface-variant)" }}>
          Stream ended. See you next time!
        </p>
      </div>
    </div>
  );
}
