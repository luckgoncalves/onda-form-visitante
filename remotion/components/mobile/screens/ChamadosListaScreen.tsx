import React from "react";
import { MobileStatusBar } from "../MobileStatusBar";
import { MobileAppHeader } from "../MobileAppHeader";
import { MobileBottomNav } from "../MobileBottomNav";

const FONT = "'Inter', -apple-system, sans-serif";
const NAVY = "#11187e";

const Chip: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div
    style={{
      background: active ? NAVY : "white",
      color: active ? "white" : "#374151",
      border: active ? "none" : "1px solid #d1d5db",
      borderRadius: 20,
      padding: "6px 14px",
      fontSize: 12,
      fontWeight: active ? 600 : 400,
      fontFamily: FONT,
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

export const ChamadosListaScreen: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
    <MobileStatusBar time="09:41" />
    <MobileAppHeader />

    <div
      style={{
        flex: 1,
        background: "#f9fafb",
        padding: "18px 16px",
        overflow: "hidden",
        position: "relative" as const,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#1a1a1a",
          margin: "0 0 2px 0",
          fontFamily: FONT,
        }}
      >
        Meus Chamados
      </h2>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 14px 0", fontFamily: FONT }}>
        1 chamado
      </p>

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "#f3f4f6",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 12,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: FONT }}>
          Buscar por título, código ou solicitante...
        </span>
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <Chip label="Meus chamados" active />
        <Chip label="Todos (2)" />
        <Chip label="Pendente (1)" active />
        <Chip label="Recebido" />
      </div>

      {/* Chamado card */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: "14px 16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 7,
          }}
        >
          <span style={{ fontSize: 11, color: "#6b7280", fontFamily: FONT }}>
            CHM-X1V487
          </span>
          <span
            style={{
              background: "#fef9c3",
              color: "#a16207",
              borderRadius: 12,
              padding: "2px 9px",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            Pendente
          </span>
          <span
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: 12,
              padding: "2px 9px",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            Urgente
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginLeft: "auto", flexShrink: 0 }}
          >
            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 5,
            fontFamily: FONT,
          }}
        >
          Trocar lâmpada
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: FONT }}>
          Manutenção · 23/07/2026 · Lucas Gonçalves
        </div>
      </div>

      {/* FAB */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          right: 16,
          background: NAVY,
          color: "white",
          borderRadius: 28,
          padding: "13px 22px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 6px 20px rgba(17,24,126,0.4)",
        }}
      >
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
