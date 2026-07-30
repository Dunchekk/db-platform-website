export type InfoSectionId =
  | "contacts"
  | "delivery"
  | "offer"
  | "privacy"
  | "personal-data-consent"
  | "requisites";

export const DEFAULT_INFO_SECTION: InfoSectionId = "contacts";

export const INFO_SECTIONS: Array<{ id: InfoSectionId; label: string }> = [
  { id: "contacts", label: "Контакты" },
  { id: "delivery", label: "Доставка и возврат" },
  { id: "offer", label: "Публичная оферта" },
  { id: "privacy", label: "Политика конфиденциальности" },
  {
    id: "personal-data-consent",
    label: "Соглашение с политикой конфиденциальности",
  },
  { id: "requisites", label: "Реквизиты" },
];

export function isInfoSectionId(value: string): value is InfoSectionId {
  return INFO_SECTIONS.some((section) => section.id === value);
}
