const ML_PER_FL_OZ = 29.5735
const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54

export function mlToFlOz(ml: number): number {
  return ml / ML_PER_FL_OZ
}

export function flOzToMl(flOz: number): number {
  return flOz * ML_PER_FL_OZ
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN
}

export function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
