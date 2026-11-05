import { z } from 'zod';
export const profilePatch = z.strictObject({ displayName: z.string().trim().min(1).max(80) });
export function publicProfile(user) {
  return { id: user.id, email: user.email, displayName: user.displayName ?? '' };
}
export function updateOwnProfile(actor, user, input) {
  if (!actor || !user || actor.id !== user.id) throw new Error('PROFILE_NOT_FOUND');
  const patch = profilePatch.parse(input);
  return { ...user, ...patch };
}
