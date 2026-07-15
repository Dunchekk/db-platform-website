import cls from "@/components/molecules/M_InputFile/M_InputFile.module.css";
import React, { ComponentPropsWithoutRef, useRef } from "react";

type Props = {
  className?: string;
  file: File | null;
  onChangeFile?: (file: File | null) => void;
} & ComponentPropsWithoutRef<"input">;

const M_InputFile = ({ className, file, onChangeFile, ...rest }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const clearFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChangeFile?.(null);
  };

  return (
    <div
      className={[cls.wrapper, className].filter(Boolean).join(" ")}
      onClick={() => inputRef.current?.click()}
    >
      <input
        {...rest}
        ref={inputRef}
        type="file"
        className={cls.input}
        onChange={(e) => onChangeFile(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <button className={cls.clear} type="button" onClick={clearFile}>
          X
        </button>
      ) : null}
      <span className={cls.active}>{"+"}</span>

      <span className={cls.fileName}>
        {file ? file.name : "Файл не выбран"}
      </span>
    </div>
  );
};

export default M_InputFile;
