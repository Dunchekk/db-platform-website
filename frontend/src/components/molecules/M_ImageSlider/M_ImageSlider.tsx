import React, { useCallback, useEffect, useRef, useState } from "react";

import cls from "./M_ImageSlider.module.css";

const FADE_MS = 260;
const GAP_MS = 90;

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

const M_ImageSlider = ({ images, alt, className }: Props) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const isAnimatingRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const timeoutId of timeoutsRef.current) {
      window.clearTimeout(timeoutId);
    }
    timeoutsRef.current = [];
    isAnimatingRef.current = false;
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const safeActiveIndex =
    images.length === 0 ? 0 : Math.min(activeImageIndex, images.length - 1);

  const transitionTo = useCallback(
    (nextIndex: number) => {
      if (images.length <= 1) return;
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      setIsImageVisible(false);

      timeoutsRef.current.push(
        window.setTimeout(() => {
          setActiveImageIndex(nextIndex);

          timeoutsRef.current.push(
            window.setTimeout(() => {
              setIsImageVisible(true);

              timeoutsRef.current.push(
                window.setTimeout(() => {
                  isAnimatingRef.current = false;
                }, FADE_MS)
              );
            }, GAP_MS)
          );
        }, FADE_MS)
      );
    },
    [images.length]
  );

  const goNext = useCallback(() => {
    if (images.length === 0) return;
    const nextIndex = (safeActiveIndex + 1) % images.length;
    transitionTo(nextIndex);
  }, [images.length, safeActiveIndex, transitionTo]);

  const goPrev = useCallback(() => {
    if (images.length === 0) return;
    const nextIndex = (safeActiveIndex - 1 + images.length) % images.length;
    transitionTo(nextIndex);
  }, [images.length, safeActiveIndex, transitionTo]);

  return (
    <div className={className}>
      <div
        className={cls.imgwrapper}
        onClick={(event) => {
          if (images.length <= 1) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          if (x >= rect.width / 2) {
            goNext();
          } else {
            goPrev();
          }
        }}
      >
        {images.length > 1 && (
          <>
            <div
              className={[cls.hitArea, cls.hitLeft].join(" ")}
              data-q-cursor="arrow-left"
            />
            <div
              className={[cls.hitArea, cls.hitRight].join(" ")}
              data-q-cursor="arrow-right"
            />
          </>
        )}
        {images[safeActiveIndex] && (
          <img
            className={[
              cls.sliderImg,
              isImageVisible ? cls.sliderImgVisible : cls.sliderImgHidden,
            ].join(" ")}
            src={images[safeActiveIndex]}
            alt={alt}
            draggable={false}
          />
        )}
      </div>
      <div className={cls.count}>
        {images.length > 0 ? `${safeActiveIndex + 1}/${images.length}` : ""}
      </div>
    </div>
  );
};

export default M_ImageSlider;
