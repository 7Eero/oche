"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Dart, DartSegment } from "@/types/game";

const BOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

type InputMode = "dart" | "quick";

export function ScoreInput() {
  const [mode, setMode] = useState<InputMode>("dart");
  const [multiplier, setMultiplier] = useState<"S" | "D" | "T">("S");
  const [quickValue, setQuickValue] = useState("");
  const throwDart = useGameStore((s) => s.throwDart);
  const quickEntryTurn = useGameStore((s) => s.quickEntryTurn);
  const currentTurnDarts = useGameStore((s) => s.currentTurnDarts);

  const handleNumberClick = (num: number) => {
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
    const dart: Dart = { segment: "BULL", value: 25, score: 25 };
    throwDart(dart);
    setMultiplier("S");
  };

  const handleDoubleBull = () => {
    const dart: Dart = { segment: "D-BULL", value: 25, score: 50 };
    throwDart(dart);
    setMultiplier("S");
  };

  const handleMiss = () => {
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
    <div className="flex flex-col gap-3">
      {/* Mode Toggle */}
      <div className="flex rounded-xl bg-surface-dark/60 p-1">
        <button
          onClick={() => setMode("dart")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "dart"
              ? "bg-primary-500/20 text-primary-400"
              : "text-gray-500"
          }`}
        >
          Dart by Dart
        </button>
        <button
          onClick={() => setMode("quick")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "quick"
              ? "bg-primary-500/20 text-primary-400"
              : "text-gray-500"
          }`}
        >
          Quick Entry
        </button>
      </div>

      {mode === "dart" ? (
        <>
          {/* Multiplier Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(["S", "D", "T"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`dart-button text-base ${
                  multiplier === m
                    ? m === "T"
                      ? "bg-accent text-white shadow-lg shadow-accent/30"
                      : m === "D"
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                        : "bg-surface-accent text-white shadow-lg"
                    : "bg-surface-dark/60 text-gray-400 border border-white/5"
                }`}
              >
                {m === "S" ? "Single" : m === "D" ? "Double" : "Triple"}
              </button>
            ))}
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {BOARD_NUMBERS.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={currentTurnDarts.length >= 3}
                className={`dart-button ${
                  multiplier === "T"
                    ? "bg-accent/20 text-accent-light border border-accent/30 hover:bg-accent/30"
                    : multiplier === "D"
                      ? "bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30"
                      : "bg-surface-dark/60 text-gray-200 border border-white/5 hover:bg-surface-accent/40"
                } disabled:opacity-30`}
              >
                {multiplier !== "S" && (
                  <span className="text-xs mr-0.5 opacity-60">
                    {multiplier}
                  </span>
                )}
                {num}
              </button>
            ))}
          </div>

          {/* Special Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleMiss}
              disabled={currentTurnDarts.length >= 3}
              className="dart-button bg-surface-dark/60 text-gray-400 border border-white/5 hover:bg-surface-accent/40 disabled:opacity-30"
            >
              Miss
            </button>
            <button
              onClick={handleBull}
              disabled={currentTurnDarts.length >= 3}
              className="dart-button bg-gold/20 text-gold-light border border-gold/30 hover:bg-gold/30 disabled:opacity-30"
            >
              Bull (25)
            </button>
            <button
              onClick={handleDoubleBull}
              disabled={currentTurnDarts.length >= 3}
              className="dart-button bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30 disabled:opacity-30"
            >
              D-Bull (50)
            </button>
          </div>
        </>
      ) : (
        /* Quick Entry Mode */
        <div className="flex flex-col gap-3">
          {/* Display */}
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Turn Total</p>
            <p className="text-4xl font-bold text-white">
              {quickValue || "0"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Max: 180</p>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-1.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handleQuickNumberPad(d)}
                className="dart-button bg-surface-dark/60 text-gray-200 border border-white/5 hover:bg-surface-accent/40"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleQuickNumberPad("clear")}
              className="dart-button bg-accent/20 text-accent-light border border-accent/30"
            >
              C
            </button>
            <button
              onClick={() => handleQuickNumberPad("0")}
              className="dart-button bg-surface-dark/60 text-gray-200 border border-white/5 hover:bg-surface-accent/40"
            >
              0
            </button>
            <button
              onClick={() => handleQuickNumberPad("backspace")}
              className="dart-button bg-surface-dark/60 text-gray-400 border border-white/5"
            >
              ←
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleQuickSubmit}
            disabled={!quickValue}
            className="btn-primary w-full text-lg py-4"
          >
            Submit Score
          </button>
        </div>
      )}
    </div>
  );
}
