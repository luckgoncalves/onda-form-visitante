import { staticFile } from "remotion";

let loaded = false;

export const loadOndaFonts = async () => {
  if (loaded || typeof window === "undefined") return;

  try {
    const face = new FontFace("Gotham Bold", `url(${staticFile("fonts/Gotham-Bold.otf")})`, {
      weight: "700",
      style: "normal",
    });
    await face.load();
    (document as Document).fonts.add(face);
    loaded = true;
  } catch (err) {
    console.warn("[Onda] Could not load Gotham Bold, falling back to Inter.", err);
  }
};
