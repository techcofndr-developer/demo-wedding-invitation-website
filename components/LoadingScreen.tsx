"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  onComplete: (images: HTMLImageElement[], colors: string[]) => void;
}

const TOTAL_SOURCE_FRAMES = 2550;
const TARGET_FRAME_COUNT = 300;

// Convert RGB to a soft, elegant pastel HSL color for the luxury theme
function getPastelColor(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hue = Math.round(h * 360);
  // Keep saturation in a soft luxury pastel range: 15% to 35%
  const saturation = Math.min(35, Math.max(15, Math.round(s * 100)));
  // Keep lightness high for cream/white backgrounds: 91% to 96%
  const lightness = Math.min(96, Math.max(91, Math.round(l * 100)));

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Draw the image to a 1x1 canvas to extract its average background tone
function extractFrameColor(img: HTMLImageElement): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "hsl(48, 80%, 94%)"; // Fallback cream color

    ctx.drawImage(img, 0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return getPastelColor(data[0], data[1], data[2]);
  } catch (e) {
    console.error("Error extracting frame color:", e);
    return "hsl(48, 80%, 94%)";
  }
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];
    const extractedColors: string[] = [];

    // Generate downsampled frame URLs to save memory and network bandwidth
    const frameUrls = Array.from({ length: TARGET_FRAME_COUNT }, (_, i) => {
      // Evenly distribute frame indices between 1 and 2550
      const frameIndex = Math.round(1 + (i * (TOTAL_SOURCE_FRAMES - 1)) / (TARGET_FRAME_COUNT - 1));
      const frameStr = String(frameIndex).padStart(6, '0');
      return `/frames/frame_${frameStr}.jpg`;
    });

    const handleImageLoad = (index: number, img: HTMLImageElement, color: string) => {
      loadedImages[index] = img;
      extractedColors[index] = color;
      loadedCount++;
      const percent = Math.floor((loadedCount / TARGET_FRAME_COUNT) * 100);
      setProgress(percent);

      if (loadedCount === TARGET_FRAME_COUNT) {
        // Short delay for a smoother visual transition
        setTimeout(() => {
          onComplete(loadedImages, extractedColors);
        }, 800);
      }
    };

    // Begin preloading
    frameUrls.forEach((url, index) => {
      const img = new Image();
      img.onload = () => {
        const color = extractFrameColor(img);
        handleImageLoad(index, img, color);
      };
      img.onerror = () => {
        console.error(`Failed to load frame: ${url}`);
        handleImageLoad(index, img, "hsl(48, 80%, 94%)");
      };
      img.src = url;
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfaf2] text-[#2d221b] font-serif select-none">
      {/* Decorative Traditional Border Ornament */}
      <div className="absolute inset-8 border border-[#d4af37]/30 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-1 border border-[#d4af37]/15"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xs text-center px-4">
        {/* Elegant Animated Logo/Emblem */}
        <motion.div 
          className="mb-8 w-16 h-16 rounded-full border-2 border-[#d4af37] flex items-center justify-center opacity-80"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: 360 
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <span className="text-[#d4af37] font-semibold text-lg tracking-widest">S&P</span>
        </motion.div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl tracking-[0.2em] uppercase text-[#2d221b] mb-3 font-normal">
          Loading Invitation
        </h2>
        
        {/* Subtitle */}
        <p className="text-xs tracking-widest text-[#5c4a3c] font-semibold italic mb-6">
          Shubham & Prachi
        </p>

        {/* Progress Bar Container */}
        <div className="w-48 h-[2px] bg-[#e6ded4] rounded-full overflow-hidden relative mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#d4af37] to-[#aa7c11]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.1 }}
          />
        </div>

        {/* Percentage Counter */}
        <div className="text-sm font-sans tracking-widest text-[#3d2f24] font-medium">
          {progress}%
        </div>
      </div>
    </div>
  );
}
