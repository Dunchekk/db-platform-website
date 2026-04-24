import React, { ComponentPropsWithoutRef, useEffect, useState } from "react";
import cls from "@/components/atoms/A_Toast/A_Toast.module.css";

type Props = {
  type: "error" | "success" | "default";
  message: string;
  className?: string;
  duration?: number;
  onClose: () => void;
} & ComponentPropsWithoutRef<"div">;

const A_Toast = ({
  type,
  message,
  duration = 2500,
  className,
  onClose,
}: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const ANIMATION_DURATION = 300;

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    const removeTimer = setTimeout(() => {
      onClose();
    }, duration + ANIMATION_DURATION);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={[cls.wrapper, isVisible ? cls.open : cls.hidden, className]
        .filter(Boolean)
        .join(" ")}
    >
      <span>
        {type === "error" ? "✕  " : type === "success" ? "✓  " : null}
        {message}
      </span>
    </div>
  );
};

export default A_Toast;
