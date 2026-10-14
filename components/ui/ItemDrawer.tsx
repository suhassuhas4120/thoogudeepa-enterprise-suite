"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MenuItem } from "../../types/customer";
import { useCustomerTheme } from "../../context/ThemeContext";
import { Plus, Minus, X, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  onAddToCart: (
    item: MenuItem,
    selectedOption: string,
    selectedAddOns: string[],
    quantity: number,
  ) => void;
}

export const ItemDrawer: React.FC<ItemDrawerProps> = ({
  open,
  onOpenChange,
  item,
  onAddToCart,
}) => {
  const { currentTheme } = useCustomerTheme();
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      setSelectedOption(item.optionsGroup1?.choices?.[0] ?? "");
      setSelectedAddOns([]);
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    );
  };

  const unitPrice =
    item.price +
    selectedAddOns.reduce((sum, name) => {
      const found = item.optionsGroup2?.addOns?.find((a) => a.name === name);
      return sum + (found?.extraPrice ?? 0);
    }, 0);

  const totalAmount = unitPrice * quantity;

  const handleConfirmAdd = () => {
    onAddToCart(item, selectedOption, selectedAddOns, quantity);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
          {/* Backdrop Overlay (restricted to the phone chassis) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />

          {/* In-Phone Bottom Sheet (Locked strictly to phone container width with dynamic theme colors) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-[32px] shadow-2xl border-t transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            {/* Food Hero Image Banner */}
            {item.image && (
              <div className="relative w-full h-40 bg-stone-100 shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition shadow-md cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2.5 left-4 right-4">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider font-mono shadow-xs mb-1"
                    style={{
                      backgroundColor: currentTheme.colors.primary,
                      color: currentTheme.colors.primaryFg,
                    }}
                  >
                    {item.category} • {item.prepMode}
                  </span>
                  <h3 className="truncate text-base font-black text-white drop-shadow-sm">
                    {item.name}
                  </h3>
                </div>
              </div>
            )}

            {/* Pull Bar & Header (when no image available) */}
            {!item.image && (
              <>
                <div className="flex justify-center pt-2.5 pb-1">
                  <div
                    className="h-1.5 w-10 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.borderLight }}
                  />
                </div>

                <div
                  className="flex items-center justify-between px-4 pb-2.5 pt-1 border-b"
                  style={{ borderColor: currentTheme.colors.borderLight }}
                >
                  <div className="min-w-0 pr-2">
                    <span
                      className="text-[9.5px] font-bold uppercase tracking-wider font-mono"
                      style={{ color: currentTheme.colors.primary }}
                    >
                      {item.category} • {item.prepMode}
                    </span>
                    <h3
                      className="truncate text-sm font-extrabold"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition cursor-pointer"
                    style={{
                      backgroundColor: currentTheme.colors.secondaryBg,
                      color: currentTheme.colors.secondaryFg,
                    }}
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
              {/* Description */}
              <p
                className="text-[11.5px] leading-relaxed"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {item.description}
              </p>

              {/* Option Group 1: Radio Choices */}
              {item.optionsGroup1?.choices?.length > 0 && (
                <div
                  className="rounded-2xl border p-3.5 space-y-2.5 transition-colors duration-200"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[11.5px] font-extrabold"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      {item.optionsGroup1.title === "Toss Style"
                        ? "Flavours"
                        : item.optionsGroup1.title}
                    </span>
                    <span
                      className="text-[9.5px] font-bold font-mono border px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: currentTheme.colors.secondaryBg,
                        color: currentTheme.colors.secondaryFg,
                        borderColor: currentTheme.colors.border,
                      }}
                    >
                      Choose 1
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {item.optionsGroup1.choices.map((choice) => {
                      const isChecked = selectedOption === choice;
                      return (
                        <div
                          key={choice}
                          onClick={() => setSelectedOption(choice)}
                          className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer border transition-all duration-150"
                          style={
                            isChecked
                              ? {
                                  borderColor: currentTheme.colors.pillActiveBorder,
                                  backgroundColor: currentTheme.colors.pillActiveBg,
                                  color: currentTheme.colors.pillActiveFg,
                                }
                              : {
                                  borderColor:
                                    currentTheme.colors.pillInactiveBorder ||
                                    currentTheme.colors.border,
                                  backgroundColor:
                                    currentTheme.colors.pillInactiveBg ||
                                    currentTheme.colors.bgSurface,
                                  color:
                                    currentTheme.colors.pillInactiveFg ||
                                    currentTheme.colors.textPrimary,
                                }
                          }
                        >
                          <span className="font-bold">{choice}</span>
                          <div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all"
                            style={{
                              borderColor: isChecked
                                ? currentTheme.colors.pillActiveBorder
                                : currentTheme.colors.borderLight,
                              backgroundColor: isChecked
                                ? currentTheme.colors.pillActiveBorder
                                : "transparent",
                            }}
                          >
                            {isChecked && (
                              <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Option Group 2: Add-Ons Checkboxes */}
              {item.optionsGroup2?.addOns?.length > 0 && (
                <div
                  className="rounded-2xl border p-3.5 space-y-2.5 transition-colors duration-200"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[11.5px] font-extrabold"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      {item.optionsGroup2.title || "Add-Ons"}
                    </span>
                    <span
                      className="text-[9.5px] font-bold font-mono border px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: currentTheme.colors.secondaryBg,
                        color: currentTheme.colors.secondaryFg,
                        borderColor: currentTheme.colors.border,
                      }}
                    >
                      Optional
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {item.optionsGroup2.addOns.map((addon) => {
                      const isChecked = selectedAddOns.includes(addon.name);
                      return (
                        <div
                          key={addon.name}
                          onClick={() => toggleAddOn(addon.name)}
                          className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer border transition-all duration-150"
                          style={
                            isChecked
                              ? {
                                  borderColor: currentTheme.colors.pillActiveBorder,
                                  backgroundColor: currentTheme.colors.pillActiveBg,
                                  color: currentTheme.colors.pillActiveFg,
                                }
                              : {
                                  borderColor:
                                    currentTheme.colors.pillInactiveBorder ||
                                    currentTheme.colors.border,
                                  backgroundColor:
                                    currentTheme.colors.pillInactiveBg ||
                                    currentTheme.colors.bgSurface,
                                  color:
                                    currentTheme.colors.pillInactiveFg ||
                                    currentTheme.colors.textPrimary,
                                }
                          }
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold truncate">
                              {addon.name}
                            </span>
                            <span
                              className="font-mono font-bold text-[11px]"
                              style={{
                                color: isChecked
                                  ? currentTheme.colors.pillActiveFg
                                  : currentTheme.colors.primary,
                              }}
                            >
                              (+₹{addon.extraPrice})
                            </span>
                          </div>
                          <div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all"
                            style={{
                              borderColor: isChecked
                                ? currentTheme.colors.pillActiveBorder
                                : currentTheme.colors.borderLight,
                              backgroundColor: isChecked
                                ? currentTheme.colors.pillActiveBorder
                                : "transparent",
                            }}
                          >
                            {isChecked && (
                              <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div
                className="flex items-center justify-between rounded-2xl border p-3.5 shadow-2xs transition-colors duration-200"
                style={{
                  backgroundColor: currentTheme.colors.bgSurface,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <span
                  className="text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Quantity
                </span>
                <div
                  className="flex items-center gap-1 rounded-xl border p-0.5 shadow-2xs"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-lg transition hover:brightness-110 active:scale-90 cursor-pointer"
                    style={{
                      backgroundColor: currentTheme.colors.buttonBg,
                      color: currentTheme.colors.buttonFg,
                    }}
                    title="Decrease quantity"
                  >
                    <Minus className="h-3 w-3 stroke-[3]" />
                  </button>
                  <span
                    className="px-2 text-xs font-black font-mono min-w-5 text-center"
                    style={{ color: currentTheme.colors.textPrimary }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg transition hover:brightness-110 active:scale-90 cursor-pointer"
                    style={{
                      backgroundColor: currentTheme.colors.buttonBg,
                      color: currentTheme.colors.buttonFg,
                    }}
                    title="Increase quantity"
                  >
                    <Plus className="h-3 w-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sheet Bottom Action CTA */}
            <div
              className="border-t p-3.5 shadow-md transition-colors duration-200"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.borderLight,
              }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmAdd}
                className="flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] shadow-lg transition hover:brightness-105 cursor-pointer"
                style={{
                  backgroundColor: currentTheme.colors.buttonBg,
                  color: currentTheme.colors.buttonFg,
                  boxShadow: currentTheme.colors.buttonShadow,
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 stroke-[2.2]" />
                  <span>
                    Add • {quantity} {quantity === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <span className="font-mono text-sm font-black">
                  ₹{totalAmount}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
