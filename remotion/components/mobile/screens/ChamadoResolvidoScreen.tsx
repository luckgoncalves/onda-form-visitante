import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MobileStatusBar } from "../MobileStatusBar";
import { MobileAppHeader } from "../MobileAppHeader";
import { MobileBottomNav } from "../MobileBottomNav";

const FONT = "'Inter', -apple-system, sans-serif";
const NAVY = "#11187e";
const GREEN = "#16a34a";
const GREEN_BG = "#dcfce7";

interface Props {
  frameOffset?: number;
}

export const ChamadoResolvidoScreen: React.FC<Props> = ({ frameOffset = 0 }) => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, raw - frameOffset);

  const headerOp  = interpolate(f, [0, 12],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const searchOp  = interpolate(f, [8, 20],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chipsOp   = interpolate(f, [14, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cardY     = spring({ fps, frame: Math.max(0, f - 22), config: { damping: 14 } });
  const cardOp    = interpolate(f, [22, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Badge "Resolvido" springs in slightly after card
  const badgeScale = spring({ fps, frame: Math.max(0, f - 36), config: { damping: 10, stiffness: 140 } });

  const fabOp = interpolate(f, [44, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, zoom: 1.3 }}>
      <MobileStatusBar time="09:42" />
      <MobileAppHeader />

      <div style={{ flex: 1, background: "#f9fafb", padding: "18px 16px", overflow: "hidden", position: "relative" as const }}>

        {/* Title */}
        <div style={{ opacity: headerOp }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px 0", fontFamily: FONT }}>
            Meus Chamados
          </h2>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 14px 0", fontFamily: FONT }}>1 chamado</p>
        </div>

        {/* Search */}
        <div style={{ opacity: searchOp, display: "flex", alignItems: "center", gap: 9, background: "#f3f4f6", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: FONT }}>Buscar por título, código ou solicitante...</span>
        </div>

        {/* Filter chips */}
        <div style={{ opacity: chipsOp, display: "flex", gap: 8, marginBottom: 16, overflow: "hidden" }}>
          {[
            { label: "Meus chamados", active: true },
            { label: "Todos (2)", active: false },
            { label: "Resolvido (1)", active: true },
          ].map(chip => (
            <div key={chip.label} style={{ background: chip.active ? NAVY : "white", color: chip.active ? "white" : "#374151", border: chip.active ? "none" : "1px solid #d1d5db", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: chip.active ? 600 : 400, fontFamily: FONT, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
              {chip.label}
            </div>
          ))}
        </div>

        {/* Chamado card */}
        <div style={{ opacity: cardOp, transform: `translateY(${(1 - cardY) * 40}px)`, background: "white", borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${GREEN_BG}`, boxShadow: `0 2px 12px rgba(22,163,74,0.1)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: "#6b7280", fontFamily: FONT }}>CHM-X1V487</span>

            {/* Resolvido badge animado */}
            <div style={{ transform: `scale(${badgeScale})`, transformOrigin: "left center", background: GREEN_BG, color: GREEN, borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill={GREEN} />
                <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Resolvido
            </div>

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", flexShrink: 0 }}>
              <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 5, fontFamily: FONT }}>
            Trocar lâmpada
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: FONT }}>
            Manutenção · 23/07/2026 · Lucas Gonçalves
          </div>
        </div>

        {/* FAB */}
        <div style={{ opacity: fabOp, position: "absolute", bottom: 18, right: 16, background: NAVY, color: "white", borderRadius: 28, padding: "13px 22px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 20px rgba(17,24,126,0.4)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: FONT }}>Novo Chamado</span>
        </div>

      </div>
      <MobileBottomNav active={1} />
    </div>
  );
};
