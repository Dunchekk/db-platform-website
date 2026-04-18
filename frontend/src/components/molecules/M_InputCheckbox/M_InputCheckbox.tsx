import cls from "@/components/molecules/M_InputCheckbox/M_InputCheckbox.module.css";

import React, { ComponentPropsWithoutRef } from "react";

const M_InputCheckbox = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<"input">) => {
  return (
    <input
      {...rest}
      type="checkbox"
      className={[cls.checkbox, className].filter(Boolean).join(" ")}
    />
  );
};

export default M_InputCheckbox;
