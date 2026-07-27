import React, { ComponentPropsWithRef, useState } from "react";
import cls from "@/components/molecules/M_ItemModal/M_ItemModal.module.css";
import M_Input from "../M_Input/M_Input";
import M_InfoInputs from "../M_InfoInputs/M_InfoInputs";
import A_Button from "@/components/atoms/A_Button/A_Button";
import {
  changeItem,
  CreateItemPreviewUploadError,
  createItemWithPreview,
  getItems,
} from "@/shared/api/objects";
import { PayloadDbObject } from "@/shared/types/object.types";
import { useObjects } from "@/features/objects/objects.store";
import { parsePositiveInteger } from "@/shared/helpers/parsePositiveInteger";
import M_InputFile from "../M_InputFile/M_InputFile";

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
  const initialPackageWeightGrams = obj ? String(obj.packageWeightGrams) : "";
  const initialPackageLengthCm = obj ? String(obj.packageLengthCm) : "";
  const initialPackageWidthCm = obj ? String(obj.packageWidthCm) : "";
  const initialPackageHeightCm = obj ? String(obj.packageHeightCm) : "";
  const initialPoints = obj ? obj.points.map((p) => p.point) : [];
  const initialInfo = obj
    ? obj.info.map(({ title, description }) => ({ title, description }))
    : [];

  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [position, setPosition] = useState(initialPosition);
  const [packageWeightGrams, setPackageWeightGrams] = useState(
    initialPackageWeightGrams
  );
  const [packageLengthCm, setPackageLengthCm] = useState(
    initialPackageLengthCm
  );
  const [packageWidthCm, setPackageWidthCm] = useState(initialPackageWidthCm);
  const [packageHeightCm, setPackageHeightCm] = useState(
    initialPackageHeightCm
  );
  const [points, setPoints] = useState(initialPoints);
  const [info, setInfo] = useState(initialInfo);
  const [point, setPoint] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const clearInputs = () => {
    setName("");
    setPrice("");
    setPosition("");
    setPackageWeightGrams("");
    setPackageLengthCm("");
    setPackageWidthCm("");
    setPackageHeightCm("");
    setPoints([]);
    setInfo([]);
    setPoint("");
    setPreviewFile(null);
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
    const pPackageWeightGrams = parsePositiveInteger(packageWeightGrams);
    const pPackageLengthCm = parsePositiveInteger(packageLengthCm);
    const pPackageWidthCm = parsePositiveInteger(packageWidthCm);
    const pPackageHeightCm = parsePositiveInteger(packageHeightCm);

    if (!pName || !Number.isInteger(pPrice) || !Number.isInteger(pPosition)) {
      showToast("не все обязательные поля заполнены", "error");
      return;
    }

    if (
      !pPackageWeightGrams ||
      !pPackageLengthCm ||
      !pPackageWidthCm ||
      !pPackageHeightCm
    ) {
      showToast("укажите вес и размеры упаковки целыми числами", "error");
      return;
    }

    const payload: PayloadDbObject = {
      name: pName,
      price: pPrice,
      position: pPosition,
      packageWeightGrams: pPackageWeightGrams,
      packageLengthCm: pPackageLengthCm,
      packageWidthCm: pPackageWidthCm,
      packageHeightCm: pPackageHeightCm,

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
        await createItemWithPreview(payload, previewFile);
        showToast("объект добавлен!", "success");
        clearInputs();
        const data = await getItems();
        setObjects(data);
        setIsModuleOpen(false);
      }
    } catch (e) {
      if (e instanceof CreateItemPreviewUploadError) {
        const data = await getItems();
        setObjects(data);
      }

      showToast("ошибка сохранения.", "error");
      console.error("ошибка сохранения:", e);
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
            <span className={cls.aboutpackage}>об упаковке (для СДЕК):</span>
            <M_Input
              placeholder="вес (г)"
              value={packageWeightGrams}
              type="number"
              min={1}
              step={1}
              onChange={(e) => setPackageWeightGrams(e.target.value)}
            />
            <div className={cls.packageSizes}>
              <M_Input
                placeholder="длина (см)"
                value={packageLengthCm}
                type="number"
                min={1}
                step={1}
                onChange={(e) => setPackageLengthCm(e.target.value)}
              />
              <M_Input
                placeholder="ширина (см)"
                value={packageWidthCm}
                type="number"
                min={1}
                step={1}
                onChange={(e) => setPackageWidthCm(e.target.value)}
              />
              <M_Input
                placeholder="высота (см)"
                value={packageHeightCm}
                type="number"
                min={1}
                step={1}
                onChange={(e) => setPackageHeightCm(e.target.value)}
              />
            </div>
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
            {!isChange ? (
              <>
                <span className={cls.aboutpackage}>превью:</span>
                <div className={cls.preview}>
                  <M_InputFile
                    className={cls.previewInput}
                    file={previewFile}
                    onChangeFile={setPreviewFile}
                    accept="image/*"
                  />
                </div>
              </>
            ) : null}
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
