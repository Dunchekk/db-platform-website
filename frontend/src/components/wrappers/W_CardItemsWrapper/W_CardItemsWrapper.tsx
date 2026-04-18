import React, { ComponentPropsWithoutRef } from "react";
import cls from "@/components/wrappers/W_CardItemsWrapper/W_CardItemsWrapper.module.css";
import M_CardItemBox from "@/components/molecules/M_CardItemBox/M_CardItemBox";
import { CartViewObject } from "@/shared/types/object.types";

type Props = {
  objects: CartViewObject[];
  className?: string;
} & ComponentPropsWithoutRef<"div">;

// переписать эту логику фейдинга позже

const W_CardItemsWrapper = ({ objects, className, ...rest }: Props) => {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const scrollable = objects.length > 2;
  const showFades = objects.length >= 3;
  const [scrollState, setScrollState] = React.useState(() => ({
    atTop: true,
    atBottom: true,
  }));

  const recomputeScrollState = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const atTop = el.scrollTop <= 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    setScrollState((prev) => {
      if (prev.atTop === atTop && prev.atBottom === atBottom) return prev;
      return { atTop, atBottom };
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!scrollable) {
      setScrollState({ atTop: true, atBottom: true });
      return;
    }

    const el = listRef.current;
    if (!el) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recomputeScrollState);
    };

    schedule();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [recomputeScrollState, scrollable]);

  return (
    <div
      className={[cls.wrapper, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div
        ref={listRef}
        className={cls.inner}
        data-scrollable={scrollable ? "true" : "false"}
        data-show-fades={showFades ? "true" : "false"}
        data-at-top={scrollState.atTop ? "true" : "false"}
        data-at-bottom={scrollState.atBottom ? "true" : "false"}
      >
        {objects.map((object) => (
          <M_CardItemBox key={object.id} object={object} />
        ))}
      </div>
    </div>
  );
};

export default W_CardItemsWrapper;
