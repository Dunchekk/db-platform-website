import cls from "@/layers/InfoLayer/InfoLayer.module.css";
import M_ReqInfo from "@/components/M_InfoBlocks/M_ReqInfo/M_ReqInfo";
import M_ContactInfo from "@/components/M_InfoBlocks/M_ContactInfo/M_ContactInfo";
import M_ConfInfo from "@/components/M_InfoBlocks/M_ConfInfo/M_ConfInfo";
import M_DelivInfo from "@/components/M_InfoBlocks/M_DelivInfo/M_DelivInfo";
import M_PublicInfo from "@/components/M_InfoBlocks/M_PublicInfo/M_PublicInfo";
import Q_InfoButtons from "@/components/Q_InfoButtons/Q_InfoButtons";
import { DEFAULT_INFO_SECTION, type InfoSectionId } from "@/shared/types/info";
import { useLayersStore } from "@/features/layer-switching/layers.store";

const InfoLayer = () => {
  const activeInfoSection = useLayersStore((state) => state.activeInfoSection);
  const section: InfoSectionId = activeInfoSection ?? DEFAULT_INFO_SECTION;

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
    <div className={cls.main}>
      <div className={cls.wrapper}>
        <div key={section} className={cls.fadeIn}>
          {renderBlock(section)}
        </div>
      </div>

      <Q_InfoButtons mode="info" />
    </div>
  );
};

export default InfoLayer;
