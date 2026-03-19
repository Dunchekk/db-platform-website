import cls from "@/components/Q_Loader/Q_Loader.module.css";

type Props = {
  className?: string;
  "aria-label"?: string;
};

const Q_Loader = ({ className, "aria-label": ariaLabel }: Props) => {
  return (
    <div
      className={[cls.loader, className].filter(Boolean).join(" ")}
      role="status"
      aria-label={ariaLabel ?? "Loading"}
    >
      <div className={cls.dot} />
      <div className={cls.orbit} aria-hidden="true">
        <div className={cls.orbitDot} />
      </div>
    </div>
  );
};

export default Q_Loader;

