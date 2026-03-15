import React from "react";
import cls from "@/components/Q_Button/Q_Button.module.css";

type Props = {
  children: string;
  isActive?: boolean;
  addClasses?: string;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Q_Button = ({ children, addClasses, isActive, ...rest }: Props) => {
  if (!addClasses) addClasses = "";
  if (isActive) addClasses = addClasses + cls.active;
  return (
    <button className={cls.button + " " + addClasses} {...rest}>
      {children}
    </button>
  );
};

export default Q_Button;
