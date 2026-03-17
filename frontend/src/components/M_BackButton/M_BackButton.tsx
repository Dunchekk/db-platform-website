import { Link } from "react-router";

import cls from "@/components/M_BackButton/M_BackButton.module.css";

type Props = {
  isVisible: boolean;
};

const M_BackButton = ({ isVisible }: Props) => {
  return (
    <Link
      to="/"
      aria-label="Назад на объекты"
      className={cls.button}
      data-visible={isVisible ? "true" : "false"}
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
    >
      <span className={cls.arrowText} aria-hidden="true">
        {"<————"}
      </span>
      <span className={[cls.icon, cls.eyes].join(" ")} aria-hidden="true" />
    </Link>
  );
};

export default M_BackButton;
