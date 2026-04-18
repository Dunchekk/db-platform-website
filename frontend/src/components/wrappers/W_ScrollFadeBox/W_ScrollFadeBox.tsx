import React, { ComponentPropsWithoutRef } from "react";
import cls from "@/components/wrappers/W_ScrollFadeBox/W_ScrollFadeBox.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  height: string;
  fadeSize?: string;
} & ComponentPropsWithoutRef<"div">;

const W_ScrollFadeBox = ({
  children,
  className,
  height,
  fadeSize,
  ...rest
}: Props) => {
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = React.useState(() => ({
    scrollable: false,
    atTop: true,
    atBottom: true,
  }));

  const recomputeScrollState = React.useCallback(() => {
    const el = boxRef.current;
    if (!el) return;

    const scrollable = el.scrollHeight > el.clientHeight + 1;
    const atTop = !scrollable || el.scrollTop <= 1;
    const atBottom =
      !scrollable || el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    setScrollState((prev) => {
      if (
        prev.scrollable === scrollable &&
        prev.atTop === atTop &&
        prev.atBottom === atBottom
      ) {
        return prev;
      }
      return { scrollable, atTop, atBottom };
    });
  }, []);

  React.useLayoutEffect(() => {
    const el = boxRef.current;
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
  }, [recomputeScrollState]);

  return (
    <div className={[cls.root, className].filter(Boolean).join(" ")} {...rest}>
      <div
        ref={boxRef}
        className={cls.inner}
        data-scrollable={scrollState.scrollable ? "true" : "false"}
        data-at-top={scrollState.atTop ? "true" : "false"}
        data-at-bottom={scrollState.atBottom ? "true" : "false"}
        style={
          {
            ["--scroll-fade-height" as never]: height,
            ...(fadeSize
              ? { ["--scroll-fade-size" as never]: fadeSize }
              : null),
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
};

export default W_ScrollFadeBox;
