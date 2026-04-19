import cls from "@/components/molecules/M_InfoInputs/M_InfoInputs.module.css";
import React, { ComponentPropsWithoutRef, useState } from "react";
import M_Input from "../M_Input/M_Input";
import A_Button from "@/components/atoms/A_Button/A_Button";

type Props = {
  className?: string;
  addInfo: (title: string, description: string) => void;
} & ComponentPropsWithoutRef<"div">;

const M_InfoInputs = ({ className, addInfo }: Props) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  return (
    <div className={[cls.wrapper, className].filter(Boolean).join(" ")}>
      <M_Input
        placeholder="характеристика"
        name="title"
        className={cls.input1}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <M_Input
        placeholder="значение"
        name="description"
        className={cls.input2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <A_Button
        className={cls.ok}
        type="button"
        disabled={title.trim() === "" || description.trim() === ""}
        onClick={() => {
          addInfo(title, description);
          setTitle("");
          setDescription("");
        }}
      >
        ✓
      </A_Button>
    </div>
  );
};

export default M_InfoInputs;
