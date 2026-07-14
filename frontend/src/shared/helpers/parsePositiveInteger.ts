export const parsePositiveInteger = (value: string) => {
  if (value.trim() === "") return null;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) return null;

  return parsed;
};
