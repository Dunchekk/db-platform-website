import cls from "@/admin/Admin.module.css";
import M_Input from "@/components/M_Input/M_Input";
import Q_Cursor from "@/components/Q_Cursor/Q_Cursor";
import AboutLayer from "@/layers/AboutLayer/AboutLayer";
import React from "react";

export default function Admin() {
  return (
    <div className={cls.wrapper}>
      <AboutLayer />
      <div className={cls.admin}>
        <M_Input placeholder="логин" className={cls.input} />
        <M_Input placeholder="пароль" type="password" className={cls.input} />
        <Q_Cursor />
      </div>
    </div>
  );
}
