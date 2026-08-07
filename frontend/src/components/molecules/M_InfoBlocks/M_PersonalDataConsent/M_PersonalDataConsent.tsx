import React, { ComponentPropsWithoutRef } from "react";
import { CurrentPersonalDataConsent } from "@/shared/legal/current";

type Props = { className: string } & ComponentPropsWithoutRef<"div">;

const M_PersonalDataConsent = (props: Props) => {
  return <CurrentPersonalDataConsent {...props} />;
};

export default M_PersonalDataConsent;
