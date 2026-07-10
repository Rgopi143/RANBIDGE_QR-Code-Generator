import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QRConfig } from "../types";

interface QRPreviewProps {
  url: string;
  className?: string;
  config?: QRConfig;
  canvasId?: string;
}

export default function QRPreview({ url, className = "", config, canvasId }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fgColor = config?.fgColor || "#0f172a";
  const bgColor = config?.bgColor || "#ffffff";
  const ecc = config?.ecc || "H"; // default to high for logos
  const logoType = config?.logoType || "none";
  const presetLogo = config?.presetLogo || "🔗";
  const customLogoUrl = config?.customLogoUrl || "";
  const logoText = config?.logoText || "";
  const logoSize = config?.logoSize || 24;
  const logoShape = config?.logoShape || "rounded";
  const logoPadding = config?.logoPadding !== undefined ? config.logoPadding : 4;
  const logoBgColor = config?.logoBgColor || bgColor;

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: 120,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logoType !== "none" ? "H" : ecc, // Force High error correction when logo is present
      },
      (error) => {
        if (error) {
          console.error("QR Code preview rendering error:", error);
          return;
        }

        // Draw center logo
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (logoType === "none") return;

        const size = canvas.width;
        const logoPx = size * (logoSize / 100);
        const x = (size - logoPx) / 2;
        const y = (size - logoPx) / 2;

        const pad = logoPadding * (size / 300); // scale padding to small canvas size!
        const bgX = x - pad;
        const bgY = y - pad;
        const bgSize = logoPx + pad * 2;

        ctx.fillStyle = logoBgColor;
        ctx.beginPath();
        if (logoShape === "circle") {
          ctx.arc(size / 2, size / 2, bgSize / 2, 0, Math.PI * 2);
        } else if (logoShape === "rounded") {
          const radius = 3;
          if (ctx.roundRect) {
            ctx.roundRect(bgX, bgY, bgSize, bgSize, radius);
          } else {
            ctx.rect(bgX, bgY, bgSize, bgSize);
          }
        } else {
          ctx.rect(bgX, bgY, bgSize, bgSize);
        }
        ctx.fill();

        if (logoType === "upload" && customLogoUrl) {
          const img = new Image();
          img.src = customLogoUrl;
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            if (logoShape === "circle") {
              ctx.arc(size / 2, size / 2, logoPx / 2, 0, Math.PI * 2);
              ctx.clip();
            } else if (logoShape === "rounded") {
              const radius = 2;
              if (ctx.roundRect) {
                ctx.roundRect(x, y, logoPx, logoPx, radius);
              } else {
                ctx.rect(x, y, logoPx, logoPx);
              }
              ctx.clip();
            }
            ctx.drawImage(img, x, y, logoPx, logoPx);
            ctx.restore();
          };
        } else if (logoType === "preset") {
          ctx.font = `${logoPx * 0.75}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(presetLogo, size / 2, size / 2 + (logoPx * 0.05));
        } else if (logoType === "text" && logoText) {
          ctx.fillStyle = fgColor;
          ctx.font = `bold ${logoPx * 0.4}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(logoText.substring(0, 4).toUpperCase(), size / 2, size / 2);
        }
      }
    );
  }, [url, fgColor, bgColor, ecc, logoType, presetLogo, customLogoUrl, logoText, logoSize, logoShape, logoPadding, logoBgColor]);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      className={`max-w-full h-auto aspect-square rounded-md ${className}`}
    />
  );
}
