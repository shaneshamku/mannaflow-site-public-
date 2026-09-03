export const UNION_HEALTH_ORG_NAME = "Union Health Network";

export function isUnionHealthTheme(organizationName: string) {
  return organizationName === UNION_HEALTH_ORG_NAME;
}
