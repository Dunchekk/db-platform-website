import { useEffect, useRef } from "react";

import { hideBootLoader } from "@/shared/lib/bootLoader";
import { useObjects } from "@/shared/objects/objects.context";

const BootLoaderOnReady = (): null => {
  const { isLoading } = useObjects();
  const hasHiddenRef = useRef(false);

  useEffect(() => {
    if (hasHiddenRef.current) return;
    if (isLoading) return;

    hasHiddenRef.current = true;
    hideBootLoader();
  }, [isLoading]);

  return null;
};

export default BootLoaderOnReady;
