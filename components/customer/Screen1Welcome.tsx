"use client";

import React, { useEffect, useMemo } from "react";
import { useCustomer } from "../../context/CustomerContext";
import { useCustomerTheme } from "../../context/ThemeContext";
import { useSharedBridge } from "../../store/useSharedBridge";
import { ScreenHousing } from "../ui/ScreenHousing";
import {
  Crown,
  Wifi,
  QrCode,
  Sparkles,
  ArrowRight,
  Smartphone,
  Flame,
  CookingPot,
} from "lucide-react";
import { motion } from "framer-motion";

import { normalizeTableNumber } from "../../store/useCustomerStore";

export const Screen1Welcome: React.FC = () => {
  const {
    setCurrentScreen,
    venueName,
    tableNumber,
    seatNumber,
    setTableNumber,
    setSeatNumber,
  } = useCustomer();

  const { currentTheme } = useCustomerTheme();
  const { tables } = useSharedBridge();

  // Dynamic time-based human greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🍛";
    return "Good Evening 🌙";
  }, []);

  // 1. Read ?table=T-01&seat=1 from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tblParam =
      params.get("table") ||
      params.get("t") ||
      params.get("tableNumber") ||
      tableNumber ||
      "T-01";
    const seatParam =
      params.get("seat") ||
      params.get("chair") ||
      params.get("s") ||
      String(seatNumber || 1);

    const cleanTable = normalizeTableNumber(tblParam);
    setTableNumber(cleanTable);

    const parsedSeat = parseInt(seatParam, 10);
    setSeatNumber(!isNaN(parsedSeat) && parsedSeat > 0 ? parsedSeat : 1);
  }, [setTableNumber, setSeatNumber]);

  // Dynamically resolve real table data from the shared bridge
  const activeTable = useMemo(() => {
    return (
      tables.find(
        (t) => t.number.toUpperCase() === tableNumber.toUpperCase(),
      ) ||
      tables[0] || {
        id: "tbl-01",
        number: "T-01",
        section: "Express / Couple Hall",
        capacity: 2,
        serverName: "Floor Captain",
      }
    );
  }, [tables, tableNumber]);

  const currentSeat = seatNumber || 1;

  // Connection Handlers: advance to Authentic Menu
  const handleConnectWifi = () => {
    setCurrentScreen(2);
  };

  const handleContinueMobileData = () => {
    setCurrentScreen(2);
  };

  return (
    <ScreenHousing screenNumber={1} screenTitle="WELCOME & CONNECT">
      <div
        className="flex flex-col justify-between min-h-full flex-1 p-4 pb-5 transition-colors duration-200"
        style={{ backgroundColor: currentTheme.colors.bgApp }}
      >
        {/* Top & Middle Section: Brand Header + Pushed-down Table Card */}
        <div className="flex flex-col pt-1">
          {/* Card 1: Restaurant Brand Header - Logo in Row 1, Hotel Name in Row 2 */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border p-5 shadow-xs text-center flex flex-col items-center transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            {/* Row 1: Dedicated Hotel Logo Icon */}
            <div className="relative mb-2.5">
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md ring-2"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  boxShadow: currentTheme.colors.primaryShadow,
                  borderColor: currentTheme.colors.primaryBorder,
                }}
              >
                <CookingPot className="h-7 w-7 stroke-[2]" />
                <div
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full shadow-xs ring-2 ring-white"
                  style={{
                    backgroundColor: currentTheme.colors.accent,
                    color: currentTheme.colors.accentFg,
                  }}
                >
                  <Crown className="h-3 w-3 fill-current stroke-[2.2]" />
                </div>
              </div>
            </div>

            {/* Row 2: Human Time Greeting, Hotel Name & Tagline */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-bold mb-1.5 border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
              <span>{timeGreeting}</span>
            </div>

            <h1
              className="text-sm font-black tracking-tight uppercase"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {venueName}
            </h1>

            <div
              className="flex items-center justify-center gap-1.5 mt-1 text-[10.5px] font-semibold"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              <Flame
                className="h-3 w-3"
                style={{ color: currentTheme.colors.primary }}
              />
              <span>Authentic Military Donne Biryani</span>
            </div>
          </motion.div>

          {/* Card 2: Scanned Table Information - Pushed down with intentional gap & smooth entrance moment */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl border p-3.5 shadow-xs transition-colors duration-200 mt-7"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <div
                    className="text-xs font-black font-mono"
                    style={{ color: currentTheme.colors.textPrimary }}
                  >
                    Table {activeTable.number} • Chair {currentSeat}
                  </div>
                  <div
                    className="text-[10px] font-bold"
                    style={{ color: currentTheme.colors.primary }}
                  >
                    {activeTable.section} • Dine-In QR Verified
                  </div>
                </div>
              </div>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black font-mono shadow-2xs border"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.secondaryFg,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
                VERIFIED
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Connections (Action Buttons) & Powered by Nelja Footer */}
        <div className="flex flex-col space-y-3 pt-6 mt-auto">
          {/* Card 5: Connections (Action Button + Secondary Option) */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2.5"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              type="button"
              onClick={handleConnectWifi}
              className="flex w-full items-center justify-between rounded-2xl p-4 shadow-md transition-all text-left group"
              style={{
                backgroundColor: currentTheme.colors.buttonBg,
                color: currentTheme.colors.buttonFg,
                boxShadow: currentTheme.colors.buttonShadow,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                  <Wifi className="h-5 w-5 stroke-[2.4]" />
                </div>
                <span className="text-xs font-black tracking-wide">
                  Connect With Free Restaurant Wi-Fi
                </span>
              </div>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition shrink-0" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              type="button"
              onClick={handleContinueMobileData}
              className="flex w-full items-center justify-between rounded-2xl border p-3.5 shadow-2xs transition-all text-left group"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    color: currentTheme.colors.textSecondary,
                  }}
                >
                  <Smartphone className="h-5 w-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold">
                  Continue With Mobile Data
                </span>
              </div>
              <ArrowRight
                className="h-4 w-4 group-hover:translate-x-0.5 transition shrink-0"
                style={{ color: currentTheme.colors.textMuted }}
              />
            </motion.button>
          </motion.div>

          {/* Footer: Properly Enclosed Badge Container for "Powered by Nelja" */}
          <div className="flex items-center justify-center pt-2 pb-1">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-2xs backdrop-blur-md"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <Sparkles
                className="h-3 w-3 animate-pulse"
                style={{ color: currentTheme.colors.primary }}
              />
              <span
                className="text-[10px] font-bold font-mono tracking-wider"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Powered by{" "}
                <span
                  className="font-black"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Nelja
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </ScreenHousing>
  );
};
