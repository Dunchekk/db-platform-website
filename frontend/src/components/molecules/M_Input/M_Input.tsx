import cls from "@/components/molecules/M_Input/M_Input.module.css";
import React, { ComponentPropsWithoutRef } from "react";

type Props = {
  placeholder?: string;
  id?: string;
} & ComponentPropsWithoutRef<"input">;

const M_Input = ({ placeholder, id, className, ...rest }: Props) => {
  return (
    <div className={cls.wrapper}>
      <input
        id={id}
        {...rest}
        placeholder={placeholder ? " " : null}
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
