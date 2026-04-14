const BOOT_LOADER_ID = "boot-loader";

export function hideBootLoader(): void {
  if (typeof document === "undefined") return;

  const el = document.getElementById(BOOT_LOADER_ID);
  if (!el) return;
  if (el.dataset.state === "hidden") return;

  el.dataset.state = "hidden";
  el.classList.add("is-hidden");

  const remove = () => {
    el.removeEventListener("transitionend", remove);
    el.remove();
  };

  el.addEventListener("transitionend", remove);
  window.setTimeout(remove, 600);
}

