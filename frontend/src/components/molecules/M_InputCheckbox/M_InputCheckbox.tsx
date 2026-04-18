import cls from "@/components/molecules/M_InputCheckbox/M_InputCheckbox.module.css";
import React, { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<"input">;

const M_InputCheckbox = ({ className, children, ...rest }: Props) => {
  return (
    <div className={[cls.block, className].filter(Boolean).join(" ")}>
      <input {...rest} type="checkbox" className={cls.checkbox} />
      <div className={cls.text}>{children}</div>
    </div>
  );
};

export default M_InputCheckbox;
