export const SUPPORTED_MODELS = ["gpt-4o-mini", "gpt-4o", "o3-mini"] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

export function isValidModel(model: string): model is SupportedModel {
  return (SUPPORTED_MODELS as readonly string[]).includes(model);
}
