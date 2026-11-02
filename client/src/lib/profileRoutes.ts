const profileRoutes = new Set(['profile', 'referral', 'rewards', 'earning', 'help', 'review']);

export function isProfileRoute(component: string): boolean {
  return profileRoutes.has(component);
}
