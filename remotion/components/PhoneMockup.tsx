import React from "react";
import { Img, staticFile } from "remotion";

interface PhoneMockupProps {
  children?: React.ReactNode;
  screenshot?: string;
  screenshots?: string[];
  scrollY?: number;
  /**
   * Pixels to crop from the top of every screenshot after the first one.
   * Useful when subsequent screenshots repeat the page header.
   */
  trimAfterFirst?: number;
  /**
   * Aspect ratio of the screenshots (width / height). Defaults to 589/1280
   * which matches the iPhone 14 webview captures used in this project.
   */
  imgAspectRatio?: number;
}

const PHONE_INTERIOR_WIDTH = 504;
const IMG_OVERFLOW_SCALE = 1.05;

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  screenshot,
  screenshots,
  scrollY = 0,
  trimAfterFirst = 0,
  imgAspectRatio = 589 / 1280,
}) => {
  const imageList =
    screenshots && screenshots.length > 0
      ? screenshots
      : screenshot
        ? [screenshot]
        : [];

  const renderedImgWidth = PHONE_INTERIOR_WIDTH * IMG_OVERFLOW_SCALE;
  const renderedImgHeight = renderedImgWidth / imgAspectRatio;

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
        {imageList.length > 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 0,
                lineHeight: 0,
                transform: `translateY(${-scrollY}px)`,
              }}
            >
              {imageList.map((src, i) => {
                const trim = i > 0 ? trimAfterFirst : 0;
                const wrapperHeight = renderedImgHeight - trim;
                return (
                  <div
                    key={`${src}-${i}`}
                    style={{
                      width: "105%",
                      marginLeft: "-2.5%",
                      height: wrapperHeight,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Img
                      src={staticFile(src)}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        marginTop: -trim,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
