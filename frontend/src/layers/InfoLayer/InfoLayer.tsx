import { useRef } from "react";

import cls from "@/layers/InfoLayer/InfoLayer.module.css";
import M_ReqInfo from "@/components/molecules/M_InfoBlocks/M_ReqInfo/M_ReqInfo";
import M_ContactInfo from "@/components/molecules/M_InfoBlocks/M_ContactInfo/M_ContactInfo";
import M_ConfInfo from "@/components/molecules/M_InfoBlocks/M_ConfInfo/M_ConfInfo";
import M_DelivInfo from "@/components/molecules/M_InfoBlocks/M_DelivInfo/M_DelivInfo";
import M_PublicInfo from "@/components/molecules/M_InfoBlocks/M_PublicInfo/M_PublicInfo";
import A_InfoButtons from "@/components/atoms/A_InfoButtons/A_InfoButtons";
import {
  DEFAULT_INFO_SECTION,
  type InfoSectionId,
} from "@/shared/types/info.types";
import { useLayersStore } from "@/features/layer-switching/layers.store";

const InfoLayer = () => {
  const activeInfoSection = useLayersStore((state) => state.activeInfoSection);
  const section: InfoSectionId = activeInfoSection ?? DEFAULT_INFO_SECTION;
  const closeLayer = useLayersStore((state) => state.closeLayer);
  const openedLayers = useLayersStore((state) => state.openedLayers);
  const isInfoLayerOpen = openedLayers.includes("info");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  const renderBlock = (section: InfoSectionId) => {
    switch (section) {
      case "contacts":
        return <M_ContactInfo addClasses={cls.block} />;
      case "delivery":
        return <M_DelivInfo addClasses={cls.block} />;
      case "offer":
        return <M_PublicInfo addClasses={cls.block} />;
      case "privacy":
        return <M_ConfInfo addClasses={cls.block} />;
      case "requisites":
        return <M_ReqInfo addClasses={cls.block} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cls.main}
      onPointerDown={(event) => {
        if (!isInfoLayerOpen) return;
        if (event.button !== 0) return;

        const targetNode = event.target as Node | null;
        if (!targetNode) return;

        const wrapper = wrapperRef.current;
        if (wrapper && wrapper.contains(targetNode)) return;

        const nav = navRef.current;
        if (nav && nav.contains(targetNode)) return;

        closeLayer("info");
      }}
    >
      <div className={cls.wrapper} ref={wrapperRef}>
        <div key={section} className={cls.fadeIn}>
          {renderBlock(section)}
        </div>
      </div>

      <div ref={navRef}>
        <A_InfoButtons mode="info" />
      </div>
    </div>
  );
};

export default InfoLayer;
