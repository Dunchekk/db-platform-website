import { useEffect, useRef } from "react";

import { hideBootLoader } from "@/app/providers/boot-loader/bootLoader";
import { useObjects } from "@/features/objects/objects.store";

const BootLoaderOnReady = (): null => {
  const hasHiddenRef = useRef(false); // если loader уже скрывали, второй раз не пытаться;
  const isObjectsReady = useObjects((state) => state.isObjectsReady);
  const pathname = window.location.pathname;
  const isAdminPath = pathname.startsWith("/admin");

  useEffect(() => {
    if (hasHiddenRef.current || (!isAdminPath && !isObjectsReady)) {
      return;
    }

    hasHiddenRef.current = true;
    hideBootLoader();
  }, [isAdminPath, isObjectsReady]);

  return null;
};

// boot loader существует в index.html до старта приложения
// один раз скрывается и удаляетсяж

export default BootLoaderOnReady;
