"use client";

import { getCheckoutSuggestions } from "@/lib/checkouts";

interface CheckoutHintProps {
  remaining: number;
  dartsLeft: number;
}

export function CheckoutHint({ remaining, dartsLeft }: CheckoutHintProps) {
  if (remaining > 170 || remaining < 2 || dartsLeft === 0) return null;

  const suggestions = getCheckoutSuggestions(remaining);
  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-2 animate-fade-in">
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-primary-400"
          >
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM6.39 7.155a.75.75 0 0 0-1.28.79l2.5 4a.75.75 0 0 0 1.28-.003L10 10.16l1.11 1.782a.75.75 0 0 0 1.28.003l2.5-4a.75.75 0 1 0-1.28-.79L12.5 9.064l-1.11-1.782a.75.75 0 0 0-1.28-.003L9 9.064 6.39 7.155Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs text-primary-400 font-semibold uppercase tracking-wider">
            Checkout ({remaining})
          </span>
        </div>
        <div className="space-y-1">
          {suggestions.slice(0, 3).map((route, i) => (
            <p key={i} className="text-sm text-primary-200 font-medium">
              {route.darts.map((d, j) => (
                <span key={j}>
                  {j > 0 && (
                    <span className="text-primary-500/50 mx-1">→</span>
                  )}
                  <span
                    className={`${
                      d.startsWith("D") || d === "Bull"
                        ? "text-primary-300"
                        : d.startsWith("T")
                          ? "text-accent-light"
                          : "text-gray-300"
                    }`}
                  >
                    {d}
                  </span>
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
