import React, { ComponentPropsWithRef, useState } from "react";
import cls from "@/components/molecules/M_ItemModal/M_ItemModal.module.css";
import M_Input from "../M_Input/M_Input";
import M_InfoInputs from "../M_InfoInputs/M_InfoInputs";
import A_Button from "@/components/atoms/A_Button/A_Button";
import { changeItem, createItem, getItems } from "@/shared/api/objects";
import { PayloadDbObject } from "@/shared/types/object.types";
import { useObjects } from "@/features/objects/objects.store";

type Props = {
  className?: string;
  hidden: boolean;
  objectId?: number;
  showToast: (message: string, type: "error" | "success" | "default") => void;
  setIsModuleOpen: (boolean: boolean) => void;
} & ComponentPropsWithRef<"div">;

const M_ItemModal = ({
  className,
  showToast,
  objectId,
  hidden,
  setIsModuleOpen,
}: Props) => {
  if (hidden) {
    className = [className, cls.hidden].filter(Boolean).join(" ");
  }

  const obj = useObjects((state) => state.objects).find(
    (v) => v.id === Number(objectId)
  );
  const isChange = Boolean(objectId);
  const setObjects = useObjects((state) => state.setObjects);

  const initialName = obj?.name ?? "";
  const initialPrice = obj ? String(obj.price) : "";
  const initialPosition = obj ? String(obj.position) : "";
  const initialPoints = obj ? obj.points.map((p) => p.point) : [];
  const initialInfo = obj
    ? obj.info.map(({ title, description }) => ({ title, description }))
    : [];

  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [position, setPosition] = useState(initialPosition);
  const [points, setPoints] = useState(initialPoints);
  const [info, setInfo] = useState(initialInfo);
  const [point, setPoint] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const clearInputs = () => {
    setName("");
    setPrice("");
    setPosition("");
    setPoints([]);
    setInfo([]);
    setPoint("");
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pName = String(name).trim();
    const pPrice = Number(price);
    const pPosition = Number(position);

    if (!pName || !Number.isInteger(pPrice) || !Number.isInteger(pPosition)) {
      showToast("не все обязательные поля заполнены", "error");
      return;
    }

    const payload: PayloadDbObject = {
      name: pName,
      price: pPrice,
      position: pPosition,

      points: points.map((point) => ({
        point,
      })),

      info,
    };

    setIsSubmitting(true);

    try {
      if (isChange) {
        if (!obj) {
          showToast("ни один объект не выделен", "error");
          throw Error("No object selected");
        }

        await changeItem(obj.id, payload);
        showToast("объект изменён!", "success");
        const data = await getItems();
        setObjects(data);
        setIsModuleOpen(false);
      } else {
        await createItem(payload);
        showToast("объект добавлен!", "success");
        clearInputs();
        const data = await getItems();
        setObjects(data);
        setIsModuleOpen(false);
      }
    } catch (e) {
      if (e instanceof Error) {
        showToast(`ошибка сохранения: ${e.message}`, "error");
      }
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={[cls.wrapper, className].filter(Boolean).join(" ")}
      onClick={() => setIsModuleOpen(false)}
    >
      <form
        className={cls.form}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <A_Button type="button" onClick={() => setIsModuleOpen(false)}>
          X
        </A_Button>
        <div className={cls.formwrapper}>
          <div className={cls.column1}>
            <span>об объекте:</span>
            <M_Input
              placeholder="название"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <M_Input
              placeholder="цена (₽)"
              value={price}
              type="number"
              onChange={(e) => setPrice(e.target.value)}
            />
            <M_Input
              placeholder="порядок"
              value={position}
              type="number"
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          <div className={cls.column2}>
            <span>характеристики:</span>
            <div>
              {info.map((inf, i) => {
                return (
                  <div key={`${i}${inf.title}`}>
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
            <span>дополнительно:</span>
            <div>
              {points.map((point, i) => {
                return (
                  <div key={`${i}${point}`}>
                    <span>{point}</span>
                    {"  "}
                    <A_Button type="button" onClick={() => deletePoint(i)}>
                      —
                    </A_Button>
                  </div>
                );
              })}
            </div>
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
        <A_Button className={cls.submit} type="submit" disabled={isSubmitting}>
          {isChange ? "изменить объект" : "создать объект"}
        </A_Button>
      </form>
    </div>
  );
};

export default M_ItemModal;
