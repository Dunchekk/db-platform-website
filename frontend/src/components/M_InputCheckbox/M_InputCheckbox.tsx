import cls from "@/components/M_InputCheckbox/M_InputCheckbox.module.css";

import React from "react";

type Props = Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "type"
>;

const M_InputCheckbox = ({ className, ...rest }: Props) => {
  return (
    <input
      {...rest}
      type="checkbox"
      className={[cls.checkbox, className].filter(Boolean).join(" ")}
    />
  );
};

export default M_InputCheckbox;
