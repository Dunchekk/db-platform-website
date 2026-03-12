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
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // ПОЗЖЕ ПОПРАВИТЬ!
      //eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    }
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

  if (!shouldRender) return null;

  return (
    <section
      ref={ref}
      className={[
        cls.layer,
        isOpen ? cls.open : cls.closed,
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
