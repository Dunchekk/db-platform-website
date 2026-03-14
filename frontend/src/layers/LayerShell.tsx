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

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsShown(false);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          setIsShown(true);
        });
      });
      return;
    }

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsShown(false);
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
