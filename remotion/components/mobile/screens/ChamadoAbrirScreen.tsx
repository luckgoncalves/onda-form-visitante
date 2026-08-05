import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { MobileStatusBar } from "../MobileStatusBar";
import { MobileAppHeader } from "../MobileAppHeader";
import { MobileBottomNav } from "../MobileBottomNav";

const FONT = "'Inter', -apple-system, sans-serif";
const NAVY = "#11187e";
const TEAL = "#24cead";
const TITULO_TEXT = "Trocar lâmpada";
const DESC_TEXT = "Luz do banheiro do kinder está queimada";

interface Props {
  frameOffset?: number;
}

const fadeSlide = (frame: number, start: number) =>
  interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const ChamadoAbrirScreen: React.FC<Props> = ({ frameOffset = 0 }) => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, raw - frameOffset);

  // Per-field animation
  const headerOp  = fadeSlide(f, 0);
  const field1Op  = fadeSlide(f, 8);
  const field2Op  = fadeSlide(f, 16);
  const field3Op  = fadeSlide(f, 28);
  const field4Op  = fadeSlide(f, 38);
  const photoOp   = fadeSlide(f, 48);

  // Typing on "Título"
  const typingProg = interpolate(f, [18, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayTitulo = TITULO_TEXT.slice(0, Math.round(typingProg * TITULO_TEXT.length));
  const showCursor = f >= 18 && typingProg < 1;

  // Typing on "Descrição"
  const descProg = interpolate(f, [32, 54], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayDesc = DESC_TEXT.slice(0, Math.round(descProg * DESC_TEXT.length));

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, zoom: 1.3 }}>
      <MobileStatusBar />
      <MobileAppHeader />

      <div style={{ flex: 1, background: "white", padding: "18px 18px 12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Page header */}
        <div style={{ opacity: headerOp, marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px 0", fontFamily: FONT }}>
            Abrir Chamado
          </h2>
          <p style={{ fontSize: 13, color: TEAL, margin: 0, fontFamily: FONT, lineHeight: 1.4 }}>
            Descreva o que você precisa e selecione o ministério responsável
          </p>
        </div>

        {/* Ministério */}
        <div style={{ opacity: field1Op, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: FONT, marginBottom: 6 }}>Ministério</div>
          <div style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
            <span style={{ fontSize: 14, color: "#1a1a1a", fontFamily: FONT }}>Manutenção</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        {/* Título com digitação */}
        <div style={{ opacity: field2Op, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: FONT, marginBottom: 6 }}>Título</div>
          <div style={{ border: `1.5px solid ${NAVY}`, borderRadius: 8, padding: "11px 14px", background: "white", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#1a1a1a", fontFamily: FONT }}>{displayTitulo}</span>
            {showCursor && (
              <span style={{ display: "inline-block", width: 2, height: 16, background: NAVY, marginLeft: 2, borderRadius: 1 }} />
            )}
          </div>
        </div>

        {/* Descrição com digitação */}
        <div style={{ opacity: field3Op, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: FONT, marginBottom: 6 }}>Descrição (Opcional)</div>
          <div style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "11px 14px", background: "white", minHeight: 62 }}>
            <span style={{ fontSize: 14, color: "#1a1a1a", fontFamily: FONT, lineHeight: 1.5 }}>{displayDesc}</span>
          </div>
        </div>

        {/* Prioridade */}
        <div style={{ opacity: field4Op, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: FONT, marginBottom: 6 }}>Prioridade</div>
          <div style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
            <span style={{ fontSize: 14, color: "#1a1a1a", fontFamily: FONT }}>Urgente</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        {/* Foto */}
        <div style={{ opacity: photoOp }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: FONT, marginBottom: 6 }}>Foto ou vídeo</div>
          <div style={{ width: 72, height: 72, borderRadius: 10, background: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.5)" /></svg>
            <div style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="3" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>
            </div>
          </div>
        </div>

      </div>
      <MobileBottomNav active={1} />
    </div>
  );
};
