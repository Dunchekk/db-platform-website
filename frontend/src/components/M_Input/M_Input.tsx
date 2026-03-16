import cls from "@/components/M_Input/M_Input.module.css";

import React from "react";

type Props = {
  placeholder?: string;
  id?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const M_Input = ({ placeholder, id, className, ...rest }: Props) => {
  return (
    <div className={cls.wrapper}>
      <input
        id={id}
        {...rest}
        placeholder={placeholder ? " " : undefined}
        className={[cls.input, className].filter(Boolean).join(" ")}
      />
      {placeholder ? (
        <label htmlFor={id} className={cls.label}>
          {placeholder}
        </label>
      ) : null}
    </div>
  );
};

export default M_Input;
