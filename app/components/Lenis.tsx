'use client'
import React, { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children } : { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.06
    })

    function raf(time : number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    }
  }, [])

  return children;
}