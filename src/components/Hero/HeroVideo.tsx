"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.scss";

type DataConnection = EventTarget & { saveData?: boolean };

/** Decorative motion must not compete with initial content or hidden mobile media. */
export default function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const screen = window.matchMedia("(min-width: 651px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: DataConnection }
    ).connection;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const cancel = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      idle = undefined;
      timer = undefined;
    };
    const stop = () => {
      cancel();
      video.style.opacity = "0";
      if (video.hasAttribute("src")) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
    const eligible = () =>
      screen.matches && !motion.matches && !connection?.saveData;
    const start = () => {
      if (
        disposed ||
        !eligible() ||
        document.readyState !== "complete" ||
        video.hasAttribute("src")
      )
        return;
      const attach = () => {
        if (disposed || !eligible()) return;
        video.src = src;
        video.load();
        void video.play().catch(() => {
          video.style.opacity = "0";
        });
      };
      cancel();
      if ("requestIdleCallback" in window)
        idle = window.requestIdleCallback(attach, { timeout: 1500 });
      else timer = setTimeout(attach, 250);
    };
    const update = () => {
      if (eligible()) start();
      else stop();
    };
    screen.addEventListener("change", update);
    motion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    window.addEventListener("load", update);
    update();
    return () => {
      disposed = true;
      screen.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      window.removeEventListener("load", update);
      stop();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={styles.heroVideo}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      onPlaying={(event) => {
        event.currentTarget.style.opacity = "1";
      }}
      onError={(event) => {
        event.currentTarget.style.opacity = "0";
      }}
    />
  );
}
