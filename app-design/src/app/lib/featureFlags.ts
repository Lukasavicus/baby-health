/**
 * Resolve which named variant is active for a feature key.
 * `assignments` usually comes from fetchMyFeatureFlags().
 */
export function getFeatureVariant(
  featureKey: string,
  assignments: Record<string, string>,
  fallback = "v1",
): string {
  return assignments[featureKey] ?? fallback;
}
