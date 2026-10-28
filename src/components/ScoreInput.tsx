"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Dart, DartSegment } from "@/types/game";

const BOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

type InputMode = "dart" | "quick";

interface ScoreInputProps {
  disabled?: boolean;
}

export function ScoreInput({ disabled = false }: ScoreInputProps) {
  const [mode, setMode] = useState<InputMode>("dart");
  const [multiplier, setMultiplier] = useState<"S" | "D" | "T">("S");
  const [quickValue, setQuickValue] = useState("");
  const throwDart = useGameStore((s) => s.throwDart);
  const quickEntryTurn = useGameStore((s) => s.quickEntryTurn);
  const currentTurnDarts = useGameStore((s) => s.currentTurnDarts);

  const isInputDisabled = disabled || currentTurnDarts.length >= 3;

  const handleNumberClick = (num: number) => {
    if (isInputDisabled) return;
    const segment: DartSegment = multiplier;
    let score: number;

    switch (multiplier) {
      case "D":
        score = num * 2;
        break;
      case "T":
        score = num * 3;
        break;
      default:
        score = num;
    }

    const dart: Dart = { segment, value: num, score };
    throwDart(dart);
    setMultiplier("S");
  };

  const handleBull = () => {
    if (isInputDisabled) return;
    const dart: Dart = { segment: "BULL", value: 25, score: 25 };
    throwDart(dart);
    setMultiplier("S");
  };

  const handleDoubleBull = () => {
    if (isInputDisabled) return;
    const dart: Dart = { segment: "D-BULL", value: 25, score: 50 };
    throwDart(dart);
    setMultiplier("S");
  };

  const handleMiss = () => {
    if (isInputDisabled) return;
    const dart: Dart = { segment: "S", value: 0, score: 0 };
    throwDart(dart);
    setMultiplier("S");
  };

  const handleQuickSubmit = () => {
    const total = parseInt(quickValue);
    if (!isNaN(total) && total >= 0 && total <= 180) {
      quickEntryTurn(total);
      setQuickValue("");
    }
  };

  const handleQuickNumberPad = (digit: string) => {
    if (digit === "clear") {
      setQuickValue("");
      return;
    }
    if (digit === "backspace") {
      setQuickValue((v) => v.slice(0, -1));
      return;
    }
    const newVal = quickValue + digit;
    const num = parseInt(newVal);
    if (num <= 180) {
      setQuickValue(newVal);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Mode Toggle - Fixed 38px */}
      <div className="flex rounded-xl bg-surface-dark/70 p-1 h-[38px] border border-white/5 flex-shrink-0">
        <button
          onClick={() => setMode("dart")}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
            mode === "dart"
              ? "bg-primary-500 text-white shadow-sm shadow-primary-500/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Dart by Dart
        </button>
        <button
          onClick={() => setMode("quick")}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
            mode === "quick"
              ? "bg-primary-500 text-white shadow-sm shadow-primary-500/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Quick Entry
        </button>
      </div>

      {mode === "dart" ? (
        <div className="flex flex-col gap-2 select-none">
          {/* Multiplier Selector - Fixed 42px */}
          <div className="grid grid-cols-3 gap-1.5 h-[42px] flex-shrink-0">
            {(["S", "D", "T"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                disabled={isInputDisabled}
                className={`h-full rounded-xl text-sm font-bold transition-all border ${
                  multiplier === m
                    ? m === "T"
                      ? "bg-accent text-white border-accent shadow-md shadow-accent/30"
                      : m === "D"
                        ? "bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/30"
                        : "bg-surface-accent text-white border-white/20 shadow-md"
                    : "bg-surface-dark/60 text-gray-400 border-white/5 hover:bg-surface-accent/30"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {m === "S" ? "Single (1x)" : m === "D" ? "Double (2x)" : "Triple (3x)"}
              </button>
            ))}
          </div>

          {/* Number Grid (4 rows of 5) - Strictly Fixed Height Buttons */}
          <div className="grid grid-cols-5 gap-1.5 flex-shrink-0">
            {BOARD_NUMBERS.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isInputDisabled}
                className={`h-11 sm:h-12 rounded-xl text-base font-bold flex items-center justify-center transition-all border ${
                  multiplier === "T"
                    ? "bg-accent/15 text-accent-light border-accent/40 active:bg-accent active:text-white"
                    : multiplier === "D"
                      ? "bg-primary-500/15 text-primary-300 border-primary-500/40 active:bg-primary-500 active:text-white"
                      : "bg-surface-dark/60 text-gray-100 border-white/5 active:bg-surface-accent"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {multiplier !== "S" && (
                  <span className="text-[10px] mr-0.5 opacity-60">
                    {multiplier}
                  </span>
                )}
                {num}
              </button>
            ))}
          </div>

          {/* Special Buttons (Miss, Bull, D-Bull) - Fixed Height */}
          <div className="grid grid-cols-3 gap-1.5 h-11 sm:h-12 flex-shrink-0">
            <button
              onClick={handleMiss}
              disabled={isInputDisabled}
              className="h-full rounded-xl text-xs font-bold bg-surface-dark/60 text-gray-400 border border-white/5 active:bg-surface-accent/40 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Miss (0)
            </button>
            <button
              onClick={handleBull}
              disabled={isInputDisabled}
              className="h-full rounded-xl text-xs font-bold bg-gold/15 text-gold border border-gold/30 active:bg-gold active:text-surface-950 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Bull (25)
            </button>
            <button
              onClick={handleDoubleBull}
              disabled={isInputDisabled}
              className="h-full rounded-xl text-xs font-bold bg-primary-500/15 text-primary-300 border border-primary-500/30 active:bg-primary-500 active:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              D-Bull (50)
            </button>
          </div>
        </div>
      ) : (
        /* Quick Entry Mode - Static Heights */
        <div className="flex flex-col gap-2 select-none">
          {/* Display - Fixed 76px */}
          <div className="glass-card p-2.5 text-center h-[76px] flex flex-col justify-center border border-white/10">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Turn Total</p>
            <p className="text-3xl font-black text-white leading-tight">
              {quickValue || "0"}
            </p>
          </div>

          {/* Number Pad - Fixed 4 rows of 44px */}
          <div className="grid grid-cols-3 gap-1.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handleQuickNumberPad(d)}
                className="h-11 rounded-xl text-base font-bold bg-surface-dark/60 text-gray-100 border border-white/5 active:bg-surface-accent"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleQuickNumberPad("clear")}
              className="h-11 rounded-xl text-xs font-bold bg-accent/20 text-accent-light border border-accent/30 active:bg-accent active:text-white"
            >
              Clear
            </button>
            <button
              onClick={() => handleQuickNumberPad("0")}
              className="h-11 rounded-xl text-base font-bold bg-surface-dark/60 text-gray-100 border border-white/5 active:bg-surface-accent"
            >
              0
            </button>
            <button
              onClick={() => handleQuickNumberPad("backspace")}
              className="h-11 rounded-xl text-xs font-bold bg-surface-dark/60 text-gray-400 border border-white/5 active:bg-surface-accent"
            >
              ⌫
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleQuickSubmit}
            disabled={!quickValue}
            className="btn-primary w-full h-11 text-sm font-bold flex items-center justify-center disabled:opacity-30"
          >
            Submit Score
          </button>
        </div>
      )}
    </div>
  );
}
