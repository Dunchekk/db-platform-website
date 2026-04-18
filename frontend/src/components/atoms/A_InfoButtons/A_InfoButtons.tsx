import cls from "@/components/atoms/A_InfoButtons/A_InfoButtons.module.css";
import A_Button from "../A_Button/A_Button";
import { INFO_SECTIONS } from "@/shared/types/info.types";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useState } from "react";

type Props = {
  mode?: "objects" | "info";
};

const A_InfoButtons = ({ mode }: Props) => {
  const openLayer = useLayersStore((state) => state.openLayer);
  const closeLayer = useLayersStore((state) => state.closeLayer);
  const setActiveInfoSection = useLayersStore(
    (state) => state.setActiveInfoSection
  );
  const activeInfoSection = useLayersStore((state) => state.activeInfoSection);
  const isInfoOpen = useLayersStore((state) =>
    state.openedLayers.includes("info")
  );
  const effectiveMode = mode ?? (isInfoOpen ? "info" : "objects");

  const [isObjectsMenuExpanded, setIsObjectsMenuExpanded] = useState(false);

  const handleInfoClick = (sectionId: (typeof INFO_SECTIONS)[number]["id"]) => {
    setActiveInfoSection(sectionId);
    openLayer("info");
    if (effectiveMode === "objects") {
      setIsObjectsMenuExpanded(false);
    }
  };

  const isExpanded = effectiveMode === "objects" && isObjectsMenuExpanded;

  return (
    <div
      className={[
        cls.wrapper,
        effectiveMode === "info" ? cls.infoMode : cls.objectsMode,
        isExpanded ? cls.expanded : "",
      ].join(" ")}
    >
      <div className={cls.buttons}>
        {INFO_SECTIONS.map((section) => (
          <A_Button
            key={section.id}
            isActive={isInfoOpen && activeInfoSection === section.id}
            onClick={() => handleInfoClick(section.id)}
          >
            {section.label}
          </A_Button>
        ))}
      </div>

      {effectiveMode === "info" ? (
        <button
          type="button"
          className={[cls.arrowToggle, cls.toggle].join(" ")}
          aria-label="Закрыть информацию"
          onClick={() => closeLayer("info")}
        >
          {"<————"}
        </button>
      ) : (
        <A_Button
          addClasses={cls.toggle}
          aria-label="Показать информацию"
          aria-expanded={isExpanded}
          onClick={() => setIsObjectsMenuExpanded((prev) => !prev)}
        >
          +
        </A_Button>
      )}
    </div>
  );
};

export default A_InfoButtons;
