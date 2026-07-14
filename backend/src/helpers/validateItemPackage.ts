import { validatePositiveInteger } from "./validation";

export type ItemPackageInput = {
  packageWeightGrams: unknown;
  packageLengthCm: unknown;
  packageWidthCm: unknown;
  packageHeightCm: unknown;
};

export type ValidatedItemPackage = {
  packageWeightGrams: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
};

export function validateItemPackage(
  packageInput: ItemPackageInput
): ValidatedItemPackage {
  return {
    packageWeightGrams: validatePositiveInteger(
      packageInput.packageWeightGrams,
      "packageWeightGrams"
    ),
    packageLengthCm: validatePositiveInteger(
      packageInput.packageLengthCm,
      "packageLengthCm"
    ),
    packageWidthCm: validatePositiveInteger(
      packageInput.packageWidthCm,
      "packageWidthCm"
    ),
    packageHeightCm: validatePositiveInteger(
      packageInput.packageHeightCm,
      "packageHeightCm"
    ),
  };
}
