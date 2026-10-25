"use client";
import { useEffect, useRef, useState } from "react";
/** Reusable, deterministic scene clock. Data/renderers remain dungeon-specific. */
export function useScenePlayback(duration: number) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const position = useRef(0);
  function seek(value: number) {
    position.current = Math.max(0, Math.min(duration, value));
    setTime(position.current);
  }
  function jump(value: number) {
    setPlaying(false);
    seek(value);
  }
  function toggle() {
    if (position.current >= duration) seek(0);
    setPlaying((p) => !p);
  }
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      const next = Math.min(
        duration,
        position.current + ((now - last) / 1000) * speed,
      );
      last = now;
      position.current = next;
      setTime(next);
      if (next >= duration) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const hide = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hide);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [playing, speed, duration]);
  return { time, playing, speed, setSpeed, jump, toggle };
}
