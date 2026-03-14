import { useEffect, useRef } from "react";

import cls from "@/components/Q_Cursor/Q_Cursor.module.css";

export default function Q_Cursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const lastTargetRef = useRef<EventTarget | null>(null);
  const isPointerRef = useRef(false);
  const modeRef = useRef<"default" | "arrow-left" | "arrow-right">("default");

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    const getCursorMode = (target: Element) => {
      let el: Element | null = target;
      while (el) {
        const mode = el.getAttribute("data-q-cursor");
        if (mode === "arrow-left" || mode === "arrow-right") return mode;
        el = el.parentElement;
      }
      return "default";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      cursorEl.style.setProperty("--cursor-x", `${e.clientX}px`);
      cursorEl.style.setProperty("--cursor-y", `${e.clientY}px`);

      if (e.target === lastTargetRef.current) return;
      lastTargetRef.current = e.target;

      const target = e.target;
      if (!(target instanceof Element)) return;

      const nextIsPointer = window.getComputedStyle(target).cursor === "pointer";
      if (nextIsPointer !== isPointerRef.current) {
        isPointerRef.current = nextIsPointer;
        cursorEl.classList.toggle(cls.pointer, nextIsPointer);
      }

      const nextMode = getCursorMode(target);
      if (nextMode === modeRef.current) return;
      modeRef.current = nextMode;
      cursorEl.classList.toggle(cls.arrowLeft, nextMode === "arrow-left");
      cursorEl.classList.toggle(cls.arrowRight, nextMode === "arrow-right");
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={cursorRef} className={cls.cursor} aria-hidden="true">
      <div className={cls.dot} />
    </div>
  );
}
