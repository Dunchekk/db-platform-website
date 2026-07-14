import type { CdekPackageDto } from "../../types/cdek.types";

type OrderItemPackageSnapshot = {
  quantity: number;
  packageWeightGrams: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
};

export function buildCdekPackagesFromOrderItems(
  orderItems: OrderItemPackageSnapshot[]
): CdekPackageDto[] {
  return orderItems.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      weight: item.packageWeightGrams,
      length: item.packageLengthCm,
      width: item.packageWidthCm,
      height: item.packageHeightCm,
    }))
  );
}
