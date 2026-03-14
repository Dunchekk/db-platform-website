// src/entities/layer/ui/LayerShell/LayerShell.tsx
import { ReactNode, useEffect, useRef, useState } from "react";
import cls from "./LayerShell.module.css";

type Props = {
  isOpen: boolean;
  isBlurred?: boolean;
  zIndex: number;
  children: ReactNode;
  className?: string;
};

export function LayerShell({
  isOpen,
  isBlurred = false,
  zIndex,
  children,
  className,
}: Props) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isShown, setIsShown] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const effectTokenRef = useRef(0);

  useEffect(() => {
    effectTokenRef.current += 1;
    const token = effectTokenRef.current;

    const defer = (fn: () => void) => {
      if (typeof queueMicrotask === "function") {
        queueMicrotask(fn);
      } else {
        Promise.resolve().then(fn);
      }
    };

    if (isOpen) {
      defer(() => {
        if (effectTokenRef.current !== token) return;

        setShouldRender(true);
        setIsShown(false);

        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = window.requestAnimationFrame(() => {
          if (effectTokenRef.current !== token) return;

          rafRef.current = window.requestAnimationFrame(() => {
            if (effectTokenRef.current !== token) return;

            rafRef.current = null;
            setIsShown(true);
          });
        });
      });
      return;
    }

    defer(() => {
      if (effectTokenRef.current !== token) return;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsShown(false);
    });
  }, [isOpen]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== node) return;
      if (!isOpen) {
        setShouldRender(false);
      }
    };

    node.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      node.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      effectTokenRef.current += 1;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <section
      ref={ref}
      className={[
        cls.layer,
        isShown ? cls.open : cls.closed,
        className ?? "",
      ].join(" ")}
      style={{ zIndex }}
      aria-hidden={!isOpen}
    >
      <div className={[cls.content, isBlurred ? cls.blurred : ""].join(" ")}>
        {children}
      </div>
    </section>
  );
}
