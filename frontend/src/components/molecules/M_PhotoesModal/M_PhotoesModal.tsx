import React, { ComponentPropsWithRef, useEffect, useState } from "react";
import cls from "@/components/molecules/M_PhotoesModal/M_PhotoesModal.module.css";
import { useObjects } from "@/features/objects/objects.store";
import A_Button from "@/components/atoms/A_Button/A_Button";
import {
  deleteItemFile,
  getItems,
  swapItemsFile,
  uploadItemFile,
} from "@/shared/api/objects";
import M_InputFile from "../M_InputFile/M_InputFile";
import { DbObjectImage } from "@/shared/types/object.types";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";

type Props = {
  className?: string;
  hidden: boolean;
  objectId?: number;
  setIsModuleOpen: (boolean: boolean) => void;
} & ComponentPropsWithRef<"div">;

const M_PhotoesModal = ({
  className,
  hidden,
  objectId,
  setIsModuleOpen,
}: Props) => {
  if (hidden) {
    className = [className, cls.hidden].filter(Boolean).join(" ");
  }
  const API_URL = __API_URL__;

  const object = useObjects((state) => state.objects).find(
    (o) => o.id === objectId
  );
  const images = object
    ? [...object.images]
        .sort((a, b) => a.position - b.position)
        .map((image) => ({
          ...image,
          url: API_URL + image.url,
        }))
    : [];

  console.log(images);

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const setObjects = useObjects((state) => state.setObjects);

  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success" | "default">(
    "default"
  );
  const showToast = (
    message: string,
    type: "error" | "success" | "default"
  ) => {
    setToast(message);
    setToastType(type);
  };

  useEffect(() => {
    // убираем файл по закрытой модалке
    if (hidden) {
      setFile(null);
    }
  }, [hidden]);

  const deleteImage = async (itemId: number, imageId: number) => {
    setIsSubmitting(true);
    try {
      await deleteItemFile(itemId, imageId);
      const data = await getItems();
      setObjects(data);
      showToast("Картинка удалена", "default");
    } catch (e) {
      showToast("Не удалось удалить картинку", "error");
      console.error("не удалось удалить картинку:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = async () => {
    if (!objectId || !file) {
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadItemFile(objectId, file);
      showToast("Картинка добавлена", "success");
      setFile(null);
      const data = await getItems();
      setObjects(data);
    } catch (e) {
      showToast("Не удалось загрузить картинку", "error");
      console.error("не удалось загрузить картинку:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const swapImage = async (
    image1Id: number,
    image2Id: number,
    fromIndex?: number,
    toIndex?: number
  ) => {
    if (
      !objectId ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= images.length ||
      toIndex >= images.length
    ) {
      return;
    }

    const image1 = images.find((i) => i.id === image1Id);
    const image2 = images.find((i) => i.id === image2Id);

    if (!image1 || !image2) {
      console.log("No item found");
      showToast("Картинка не найдена", "error");
      return;
    }

    const updImages: DbObjectImage[] = [image1, image2];
    setIsSubmitting(true);

    try {
      await swapItemsFile(updImages, objectId);
      const data = await getItems();
      setObjects(data);
    } catch (e) {
      showToast("Не удалось переместить картинку", "error");
      console.error("не удалось переместить картинку:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={[cls.wrapper, className].filter(Boolean).join(" ")}
      onClick={() => setIsModuleOpen(false)}
    >
      <div className={cls.main} onClick={(e) => e.stopPropagation()}>
        <A_Button type="button" onClick={() => setIsModuleOpen(false)}>
          X
        </A_Button>

        <div className={cls.imgwrapper}>
          {images.map((image, i) => {
            return (
              <div className={cls.image} key={image.url}>
                <img src={image.url} alt="image" className={cls.imgsrc} />
                <div className={cls.navigation}>
                  <A_Button
                    type="button"
                    onClick={() =>
                      swapImage(images[i].id, images[i - 1].id, i, i - 1)
                    }
                    disabled={i - 1 === -1 || isSubmitting}
                  >
                    {"<"}
                  </A_Button>
                  <A_Button
                    type="button"
                    onClick={() => {
                      if (!images[i + 1].id) return;
                      swapImage(images[i].id, images[i + 1].id, i, i + 1);
                    }}
                    disabled={i + 1 === images.length || isSubmitting}
                  >
                    {">"}
                  </A_Button>
                </div>
                <A_Button onClick={() => deleteImage(image.itemId, image.id)}>
                  удалить
                </A_Button>
              </div>
            );
          })}

          <div className={cls.image}>
            <M_InputFile
              className={cls.input}
              file={file}
              onChangeFile={setFile}
              accept="image/*"
            />
            <A_Button
              disabled={!file || isSubmitting}
              type="button"
              onClick={() => addImage()}
            >
              добавить
            </A_Button>
          </div>
        </div>
      </div>
      {toast ? (
        <A_Toast
          type={toastType}
          message={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
};

export default M_PhotoesModal;
