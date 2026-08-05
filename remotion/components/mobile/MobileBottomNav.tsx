import React from "react";

const NAVY = "#11187e";
const INACTIVE = "#9ca3af";
const FONT = "'Inter', -apple-system, sans-serif";

interface NavItemProps {
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ label, active, icon }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      paddingTop: 10,
      paddingBottom: 6,
      color: active ? NAVY : INACTIVE,
    }}
  >
    {icon}
    <span
      style={{
        fontSize: 10,
        fontFamily: FONT,
        fontWeight: active ? 600 : 400,
        color: active ? NAVY : INACTIVE,
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </span>
  </div>
);

export const MobileBottomNav: React.FC<{ active?: number }> = ({ active = 1 }) => (
  <div
    style={{
      height: 72,
      background: "white",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      flexShrink: 0,
    }}
  >
    {/* Formulários */}
    <NavItem
      label="Formulários"
      active={active === 0}
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
      }
    />

    {/* Chamados — selected by default */}
    <NavItem
      label="Chamados"
      active={active === 1}
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9V7a1 1 0 011-1h18a1 1 0 011 1v2a3 3 0 000 6v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a3 3 0 000-6z" />
          <line x1="9" y1="6" x2="9" y2="18" strokeDasharray="2 2" />
        </svg>
      }
    />

    {/* Empresas */}
    <NavItem
      label="Empresas"
      active={active === 2}
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="1" />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      }
    />

    {/* Mais */}
    <NavItem
      label="Mais"
      active={active === 3}
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      }
    />
  </div>
);
