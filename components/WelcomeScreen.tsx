import React, { useState } from "react";
import { ThemeTogglePill } from "./ui/ThemeTogglePill";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

/* 
 * Full-Viewport Screen Fixed Wrapper:
 * Latches fixed to the viewport edges (inset: 0) so that mobile browser URL/navigation bars
 * or safe-area calculations can NEVER produce any cutoff, blank gap, or black space at the bottom.
 */
.royal-screen-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: #080502;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  z-index: 40;
}

/* 
 * 100% Screen Height Master Frame:
 * Fills 100% viewport width and height on mobile devices with zero dragging or compression.
 */
.royal-master-frame {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 520px;
  margin: 0 auto;
  overflow: hidden;
  background-color: #080502;
}

/* 
 * 4K Pristine Master Painting:
 * Preserves 100% authentic, uncompressed proportions of the biryani pot, lanterns,
 * arch, and typography with ZERO stretching.
 * object-fit: cover ensures it fills 100% edge-to-edge with ZERO blank space.
 */
.royal-master-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.2s ease;
}

/*
 * Table & Seat Badge Hotspot:
 * 100% authentic original Table 02 · Seat 01 artwork from the master painting.
 * Zero overlays, zero pasted borders.
 */
.royal-table-pill-hotspot {
  position: absolute;
  top: 25.35%;
  left: 50%;
  transform: translateX(-50%);
  width: 47.9%;
  height: 5.8%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/*
 * Seamless Interactive Guest Name Pill Tap Zone:
 * Covers the pill area for easy touch.
 */
.royal-guest-input-hotspot {
  position: absolute;
  top: 40.8%;
  left: 42.5%;
  width: 36.5%;
  height: 5.8%;
  z-index: 10;
  display: flex;
  align-items: center;
  cursor: text;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0;
  margin: 0;
}

/*
 * Name Input Field:
 * Starts EXACTLY where the letter 'G' of "Guest Name" is positioned.
 * Full generous width spans to the right pill border so names never get pushed or scrolled out of view.
 * 100% transparent: NO background box, NO border, NO box-shadow, and NO black strip!
 */
.royal-guest-input-field {
  width: 100%;
  height: 100%;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  color: #FFF0C5 !important;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 600;
  font-size: clamp(16px, 2.3vh, 21px);
  letter-spacing: 0.2px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.85);
  text-align: left;
  padding: 0;
  margin: 0;
  caret-color: #F3D38B;
  -webkit-tap-highlight-color: transparent;
}

/* 
 * Flawless Autofill & Paste Protection:
 * Prevents Chrome / Android from turning white OR drawing any solid box shadow.
 * Transition delay keeps the background completely transparent on paste/autofill.
 */
.royal-guest-input-field:-webkit-autofill,
.royal-guest-input-field:-webkit-autofill:hover,
.royal-guest-input-field:-webkit-autofill:focus,
.royal-guest-input-field:-webkit-autofill:active {
  transition: background-color 50000s ease-in-out 0s, color 50000s ease-in-out 0s !important;
  -webkit-text-fill-color: #FFF0C5 !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
}

.royal-guest-input-field::selection {
  background-color: rgba(243, 211, 139, 0.35);
  color: #FFF0C5;
}

.royal-guest-input-field::placeholder {
  color: transparent;
}

/*
 * Transparent "Explore Our Menu" Button Hotspot:
 * Mapped to the glowing golden button in the artwork.
 */
.royal-btn-hotspot {
  position: absolute;
  top: 73.7%;
  left: 50%;
  transform: translateX(-50%);
  width: 57.8%;
  height: 12.4%;
  z-index: 20;
}

.royal-master-btn-action {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  outline: none;
  transition: transform 0.15s ease, filter 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.royal-master-btn-action:hover {
  filter: brightness(1.10) drop-shadow(0 0 25px rgba(255, 215, 120, 0.5));
}

.royal-master-btn-action:active {
  transform: scale(0.975);
}

.royal-master-btn-action:focus-visible {
  outline: 2px solid #FFF0C5;
  outline-offset: 4px;
}
`;

interface WelcomeScreenProps {
  tableNumber?: string;
  seatNumber?: string | number;
  initialGuestName?: string;
  onExploreMenu?: (info: { guestName: string; tableNumber: string; seatNumber: string | number }) => void;
}

export default function WelcomeScreen({
  tableNumber = "02",
  seatNumber = "01",
  initialGuestName = "",
  onExploreMenu,
}: WelcomeScreenProps) {
  const [guestName, setGuestName] = useState(initialGuestName);

  function handleExplore() {
    onExploreMenu?.({
      guestName: guestName.trim(),
      tableNumber,
      seatNumber,
    });
  }

  // Active artwork layer: switches to clean slot only when the user types a real name,
  // completely eliminating any pasted pill, blur, or ghosting!
  const hasTypedName = Boolean(guestName && guestName.trim().length > 0);

  return (
    <>
      <style>{css}</style>

      <div className="royal-screen-wrapper">
        <ThemeTogglePill variant="floating" />

        {/* 100% Screen Height Master Frame with Zero Blank Space & Natural Proportions */}
        <div className="royal-master-frame">
          {/* Default pristine 4K artwork showing 'Guest Name' placeholder */}
          <img
            src="/assets/royal-master-source.png"
            alt="Thoogudeepa Donne Biryani Mane Royal Welcome"
            className="royal-master-photo"
            style={{ opacity: hasTypedName ? 0 : 1 }}
          />

          {/* 
            Seamless pixel-level textless layer:
            Active only when typing, seamlessly replacing only the text characters
            with ZERO box, ZERO border, ZERO blur, and ZERO dark patch!
          */}
          <img
            src="/assets/royal-master-flawless-textless.png"
            alt=""
            className="royal-master-photo"
            style={{ opacity: hasTypedName ? 1 : 0 }}
          />

          {/* Table & Seat Badge Hotspot (original Table 02 · Seat 01 artwork) */}
          <div className="royal-table-pill-hotspot" aria-label="Table 02 • Seat 01" />

          {/* 
            Seamless Interactive Guest Name Input:
            Starts EXACTLY where the letter 'G' of "Guest Name" is positioned.
            Full width across the glass pill with zero black strip and zero cut off.
          */}
          <label className="royal-guest-input-hotspot" title="Enter your name">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder=""
              aria-label="Guest name"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              maxLength={30}
              className="royal-guest-input-field"
            />
          </label>

          {/* Explore Our Menu Button Hotspot */}
          <div className="royal-btn-hotspot">
            <button
              type="button"
              className="royal-master-btn-action touch-manipulation"
              onClick={handleExplore}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleExplore();
              }}
              aria-label="Explore Our Menu"
              title="Explore Our Menu"
            />
          </div>
        </div>
      </div>
    </>
  );
}
