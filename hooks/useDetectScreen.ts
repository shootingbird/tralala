// src/hooks/useDetectScreen.ts
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsMobile } from "@/slices/screenSlice";

export function useDetectScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqQuery = "(max-width: 767px)";
    const mql = window.matchMedia(mqQuery);

    dispatch(setIsMobile(Boolean(mql.matches)));

    const mqChangeHandler = (e: MediaQueryListEvent | MediaQueryList) => {
      dispatch(setIsMobile(Boolean(e.matches)));
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", mqChangeHandler as EventListener);
    } else if (
      typeof (
        mql as unknown as {
          addListener?: (listener: (ev: MediaQueryListEvent) => void) => void;
        }
      ).addListener === "function"
    ) {
      (
        mql as unknown as {
          addListener: (listener: (ev: MediaQueryListEvent) => void) => void;
        }
      ).addListener(mqChangeHandler);
    }

    let rafId: number | null = null;
    let timeoutId: number | null = null;
    const debounceMs = 120;
    const resizeHandler = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      rafId = requestAnimationFrame(() => {
        timeoutId = window.setTimeout(() => {
          const matches = window.matchMedia(mqQuery).matches;
          dispatch(setIsMobile(matches));
        }, debounceMs);
      });
    };

    window.addEventListener("resize", resizeHandler);

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", mqChangeHandler as EventListener);
      } else if (
        typeof (
          mql as unknown as {
            removeListener?: (
              listener: (ev: MediaQueryListEvent) => void
            ) => void;
          }
        ).removeListener === "function"
      ) {
        (
          mql as unknown as {
            removeListener: (
              listener: (ev: MediaQueryListEvent) => void
            ) => void;
          }
        ).removeListener(mqChangeHandler);
      }
      window.removeEventListener("resize", resizeHandler);
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [dispatch]);
}
