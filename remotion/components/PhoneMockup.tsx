import React from "react";
import { Img, staticFile } from "remotion";

interface PhoneMockupProps {
  children?: React.ReactNode;
  screenshot?: string;
  scrollY?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  screenshot,
  scrollY = 0,
}) => {
  return (
    <div
      style={{
        width: 540,
        height: 1100,
        borderRadius: 70,
        background: "#0a0a0a",
        padding: 18,
        boxShadow:
          "0 40px 100px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 56,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 28,
            borderRadius: 14,
            background: "#0a0a0a",
            zIndex: 10,
          }}
        />
        {screenshot ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Img
              src={staticFile(screenshot)}
              style={{
                width: "105%",
                height: "auto",
                display: "block",
                marginLeft: "-2.5%",
                transform: `translateY(${-scrollY}px)`,
              }}
            />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
