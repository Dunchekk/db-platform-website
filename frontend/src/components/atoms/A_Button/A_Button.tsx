import React, { ComponentPropsWithoutRef } from "react";
import cls from "@/components/atoms/A_Button/A_Button.module.css";

type Props = {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
} & ComponentPropsWithoutRef<"button">;

const A_Button = ({ children, isActive, className, ...rest }: Props) => {
  if (isActive) className = [className, cls.active].filter(Boolean).join(" ");
  return (
    <button
      className={[className, cls.button].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
};

export default A_Button;
