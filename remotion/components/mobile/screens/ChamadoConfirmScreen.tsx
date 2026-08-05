import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MobileStatusBar } from "../MobileStatusBar";
import { MobileAppHeader } from "../MobileAppHeader";
import { MobileBottomNav } from "../MobileBottomNav";

const FONT = "'Inter', -apple-system, sans-serif";
const TEAL = "#24cead";

interface Props {
  frameOffset?: number;
}

const ROWS = [
  { label: "Código",      value: "CHM-X1V487",   color: "#1a1a1a" },
  { label: "Título",      value: "Trocar lâmpada", color: "#1a1a1a" },
  { label: "Ministério",  value: "Manutenção",    color: "#1a1a1a" },
  { label: "Prioridade",  value: "Urgente",       color: "#dc2626" },
  { label: "Status",      value: "Pendente",      color: "#d97706" },
];

export const ChamadoConfirmScreen: React.FC<Props> = ({ frameOffset = 0 }) => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, raw - frameOffset);

  const checkScale = spring({ fps, frame: f, config: { damping: 10, stiffness: 120 } });
  const titleOp   = interpolate(f, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOp     = interpolate(f, [26, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rowOp = (i: number) =>
    interpolate(f, [36 + i * 7, 48 + i * 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, zoom: 1.3 }}>
      <MobileStatusBar />
      <MobileAppHeader />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", gap: 22, background: "white" }}>

        {/* Checkmark */}
        <div style={{ transform: `scale(${checkScale})`, width: 96, height: 96, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 14px ${TEAL}20` }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill={TEAL} />
            <path d="M7.5 12l3 3 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Message */}
        <div style={{ textAlign: "center" }}>
          <div style={{ opacity: titleOp, fontSize: 20, fontWeight: 700, color: "#1a1a1a", fontFamily: FONT, marginBottom: 8 }}>
            Chamado enviado!
          </div>
          <div style={{ opacity: subOp, fontSize: 13, color: "#6b7280", fontFamily: FONT, lineHeight: 1.5 }}>
            Seu chamado foi registrado. Acompanhe o status na lista de chamados.
          </div>
        </div>

        {/* Detail card */}
        <div style={{ width: "100%", background: "#f9fafb", borderRadius: 14, padding: "4px 16px", border: "1px solid #e5e7eb" }}>
          {ROWS.map((row, i) => (
            <div key={row.label} style={{ opacity: rowOp(i), display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, paddingBottom: 10, borderBottom: i < ROWS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <span style={{ fontSize: 13, color: "#6b7280", fontFamily: FONT }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: row.color, fontFamily: FONT }}>{row.value}</span>
            </div>
          ))}
        </div>

      </div>
      <MobileBottomNav active={1} />
    </div>
  );
};
