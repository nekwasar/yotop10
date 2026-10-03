import { UsernameHistory } from '../models/UsernameHistory';
import { User } from '../models/User';

export function identityNameCandidates(username: string): string[] {
  const lower = username.toLowerCase();
  const bare = lower.replace(/^(?:a_)+/, '');
  const candidates = new Set<string>([username, lower, bare, `a_${bare}`].filter((c) => c.length > 0));
  return Array.from(candidates);
}

export async function isUsernameAvailable(username: string, currentUserId?: string): Promise<{ available: boolean }> {
  const candidates = identityNameCandidates(username);
  const existingUser = await User.findOne({
    $or: [
      { username: { $in: candidates } },
      { custom_display_name: { $in: candidates } },
    ]
  });

  if (existingUser) {
    if (currentUserId && existingUser.user_id === currentUserId) {
      return { available: true };
    }
    return { available: false };
  }

  return { available: true };
}

export function buildProfileLookupQuery(username: string): Record<string, unknown> {
  const cleanUsername = username.replace(/^a_/, '');
  const isShort = cleanUsername.length === 4;

  if (isShort) {
    const short = `a_${cleanUsername.toLowerCase()}`;
    return {
      $or: [
        { short_username: short },
        { short_username: username.toLowerCase() },
        { short_username: { $regex: `^a_${cleanUsername}`, $options: 'i' } },
        { custom_display_name: { $regex: `^a_${cleanUsername}`, $options: 'i' } },
        { username: { $regex: `^a_${cleanUsername}`, $options: 'i' } },
        { custom_display_name: { $regex: `^a_${cleanUsername}`, $options: 'i' } },
      ],
    };
  }

  return {
    $or: [
      { user_id: username },
      { username },
      { username: `a_${cleanUsername}` },
      { custom_display_name: username },
      { custom_display_name: `a_${cleanUsername}` },
      { short_username: username.toLowerCase() },
      { short_username: `a_${cleanUsername.toLowerCase()}` },
      { custom_display_name: { $regex: `^a_${cleanUsername}`, $options: 'i' } },
      { short_username: { $regex: `^a_${cleanUsername}`, $options: 'i' } },
    ],
  };
}

/**
 * Record a username change for history tracking
 */
export async function recordUsernameChange(
  userId: string, 
  newUsername: string, 
  oldUsername: string | null
): Promise<void> {
  // Record the new username
  await UsernameHistory.create({
    user_id: userId,
    username: newUsername,
    custom_display_name: newUsername,
    previous_username: oldUsername,
    released_at: null,
  });

  // Mark the old username as released if it exists
  if (oldUsername) {
    await UsernameHistory.create({
      user_id: userId,
      username: oldUsername,
      custom_display_name: oldUsername,
      previous_username: null,
      released_at: new Date(),
    });
  }
}
