export function hasCompleteProfile(profile) {
  return ['first_name', 'last_name', 'city', 'province'].every((key) => typeof profile?.[key] === 'string' && profile[key].trim().length > 0);
}
