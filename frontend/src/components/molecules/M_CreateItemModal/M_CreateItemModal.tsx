import React, { ComponentPropsWithRef, useState } from "react";
import cls from "@/components/molecules/M_CreateItemModal/M_CreateItemModal.module.css";
import M_Input from "../M_Input/M_Input";
import M_InfoInputs from "../M_InfoInputs/M_InfoInputs";
import A_Button from "@/components/atoms/A_Button/A_Button";
import { createItem } from "@/shared/api/objects";
import {
  CreateItemInfoPayload,
  PayloadDbObject,
} from "@/shared/types/object.types";

type Props = {
  className?: string;
  hidden: boolean;
  setIsModuleOpen: (boolean: boolean) => void;
} & ComponentPropsWithRef<"div">;

const M_CreateItemModal = ({ className, hidden, setIsModuleOpen }: Props) => {
  if (hidden) {
    className = [className, cls.hidden].filter(Boolean).join(" ");
  }

  const [points, setPoints] = useState<string[]>([]);
  const [point, setPoint] = useState<string>("");

  const [info, setInfo] = useState<CreateItemInfoPayload[]>([]);

  const deleteInfo = (index: number) => {
    setInfo((prev) => prev.filter((_, i) => i !== index));
  };

  const deletePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const addInfo = (title: string, description: string) => {
    const newInfo = [
      ...info,
      {
        title: title.trim(),
        description: description.trim(),
      },
    ];
    setInfo(newInfo);
  };

  const addPoint = (point: string) => {
    const newPoints = [...points, point.trim()];
    setPoints(newPoints);
  };

  const createObject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    const position = Number(formData.get("position"));

    if (!name || !Number.isInteger(price) || !Number.isInteger(position)) {
      return;
    }

    const payload: PayloadDbObject = {
      name: String(formData.get("name") ?? ""),
      price: price,
      position: position,

      points: points.map((point) => ({
        point,
      })),

      info,
    };

    await createItem(payload); // написать обработку ошибок, очиску при успехеы
  };

  return (
    <div className={[cls.wrapper, className].filter(Boolean).join(" ")}>
      <form className={cls.form} onSubmit={createObject}>
        <A_Button type="button" onClick={() => setIsModuleOpen(false)}>
          X
        </A_Button>
        <div className={cls.formwrapper}>
          <div className={cls.column1}>
            <span>Об объекте:</span>
            <M_Input placeholder="название" name="name" />
            <M_Input placeholder="цена (₽)" name="price" />
            <M_Input placeholder="порядок" name="position" />
          </div>

          <div className={cls.column2}>
            <span>Характеристики:</span>
            <div>
              {info.map((inf, i) => {
                return (
                  <div key={i}>
                    <span>{inf.title}</span>: <span>{inf.description}</span>
                    {"  "}
                    <A_Button type="button" onClick={() => deleteInfo(i)}>
                      —
                    </A_Button>
                  </div>
                );
              })}
            </div>
            <M_InfoInputs addInfo={addInfo} />
          </div>

          <div className={cls.column3}>
            <span>Дополнительно:</span>
            {points.map((point, i) => {
              return (
                <div key={i}>
                  <span>{point}</span>
                  {"  "}
                  <A_Button type="button" onClick={() => deletePoint(i)}>
                    —
                  </A_Button>
                </div>
              );
            })}
            <div className={cls.points}>
              <M_Input
                placeholder="особенность"
                className={cls.point}
                value={point}
                onChange={(e) => setPoint(e.target.value)}
              />
              <A_Button
                className={cls.ok}
                disabled={point.trim() === ""}
                type="button"
                onClick={() => {
                  addPoint(point);
                  setPoint("");
                }}
              >
                ✓
              </A_Button>
            </div>
            <div></div>
          </div>
        </div>
        <A_Button className={cls.submit} type="submit">
          Создать объект
        </A_Button>
      </form>
    </div>
  );
};

export default M_CreateItemModal;
