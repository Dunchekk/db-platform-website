import React from "react";
import cls from "@/components/atoms/A_Button/A_Button.module.css";

type Props = {
  children: string;
  isActive?: boolean;
  addClasses?: string;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const A_Button = ({ children, addClasses, isActive, ...rest }: Props) => {
  if (!addClasses) addClasses = "";
  if (isActive) addClasses = [addClasses, cls.active].filter(Boolean).join(" ");
  return (
    <button className={cls.button + " " + addClasses} {...rest}>
      {children}
    </button>
  );
};

export default A_Button;
