import { useEffect, useRef } from "react";

import cls from "@/components/atoms/A_Cursor/A_Cursor.module.css";

const CIRCLE_AVOID_GAP_PX = 3;

export default function A_Cursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const lastTargetRef = useRef<EventTarget | null>(null);
  const isPointerRef = useRef(false);
  const modeRef = useRef<"default" | "arrow-left" | "arrow-right">("default");
  const qCircleHitRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    qCircleHitRef.current = document.querySelector<HTMLElement>(
      '[data-q-circle-hit="true"]'
    );

    const getCursorMode = (target: Element) => {
      let el: Element | null = target;
      while (el) {
        const mode = el.getAttribute("data-q-cursor");
        if (mode === "arrow-left" || mode === "arrow-right") return mode;
        el = el.parentElement;
      }
      return "default";
    };

    const avoidQCircle = (x: number, y: number) => {
      const qCircleEl =
        qCircleHitRef.current ??
        document.querySelector<HTMLElement>('[data-q-circle-hit="true"]');
      qCircleHitRef.current = qCircleEl;
      if (!qCircleEl) return { x, y };

      const rect = qCircleEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return { x, y };

      const circleX = rect.left + rect.width / 2;
      const circleY = rect.top + rect.height / 2;
      const circleRadius = rect.width / 2;

      const dotRadius = (dotRef.current?.offsetWidth ?? 18) / 2;

      const minDistance = circleRadius + dotRadius + CIRCLE_AVOID_GAP_PX;

      const dx = x - circleX;
      const dy = y - circleY;
      const distance = Math.hypot(dx, dy);

      if (distance >= minDistance) return { x, y };

      if (distance === 0) {
        return { x: circleX + minDistance, y: circleY };
      }

      const scale = minDistance / distance;
      return { x: circleX + dx * scale, y: circleY + dy * scale };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      const nextPos = avoidQCircle(e.clientX, e.clientY);
      cursorEl.style.setProperty("--cursor-x", `${nextPos.x}px`);
      cursorEl.style.setProperty("--cursor-y", `${nextPos.y}px`);

      if (e.target === lastTargetRef.current) return;
      lastTargetRef.current = e.target;

      const target = e.target;
      if (!(target instanceof Element)) return;

      const nextIsPointer =
        window.getComputedStyle(target).cursor === "pointer";
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
      <div ref={dotRef} className={cls.dot} />
    </div>
  );
}
