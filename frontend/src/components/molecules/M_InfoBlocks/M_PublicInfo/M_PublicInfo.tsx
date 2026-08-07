import React, { ComponentPropsWithoutRef } from "react";
import { CurrentOffer } from "@/shared/legal/current";

type Props = { className: string } & ComponentPropsWithoutRef<"div">;

const M_PublicInfo = (props: Props) => {
  return <CurrentOffer {...props} />;
};

export default M_PublicInfo;
