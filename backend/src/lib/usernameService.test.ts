import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isUsernameAvailable, recordUsernameChange, identityNameCandidates, buildProfileLookupQuery } from './usernameService';
import { User } from '../models/User';
import { UsernameHistory } from '../models/UsernameHistory';

vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

vi.mock('../models/UsernameHistory', () => ({
  UsernameHistory: {
    create: vi.fn().mockResolvedValue({}),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(UsernameHistory.create).mockResolvedValue({});
});

describe('usernameService', () => {
  describe('isUsernameAvailable', () => {
    it('returns available=true when no user has the username', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const result = await isUsernameAvailable('newuser');
      expect(result).toEqual({ available: true });
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { username: { $in: ['newuser', 'a_newuser'] } },
          { custom_display_name: { $in: ['newuser', 'a_newuser'] } },
        ],
      });
    });

    it('returns available=false when another user has the username', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        user_id: 'other123',
        username: 'takenname',
      });
      const result = await isUsernameAvailable('takenname');
      expect(result).toEqual({ available: false });
    });

    it('returns available=true when the current user owns the username', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        user_id: 'user123',
        username: 'myname',
      });
      const result = await isUsernameAvailable('myname', 'user123');
      expect(result).toEqual({ available: true });
    });

    it('returns available=false when the username is taken by someone else (with currentUserId)', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        user_id: 'other456',
        username: 'desiredname',
      });
      const result = await isUsernameAvailable('desiredname', 'user123');
      expect(result).toEqual({ available: false });
    });

    it('checks both username and custom_display_name fields', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        user_id: 'other789',
        custom_display_name: 'displayname',
        username: 'different',
      });
      const result = await isUsernameAvailable('displayname');
      expect(result).toEqual({ available: false });
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { username: { $in: ['displayname', 'a_displayname'] } },
          { custom_display_name: { $in: ['displayname', 'a_displayname'] } },
        ],
      });
    });

    it('allows same user when matched via custom_display_name', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        user_id: 'user123',
        username: 'othername',
        custom_display_name: 'mydisplay',
      });
      const result = await isUsernameAvailable('mydisplay', 'user123');
      expect(result).toEqual({ available: true });
    });

    it('handles DB query failure by propagating the error', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB connection lost'));
      await expect(isUsernameAvailable('anyname')).rejects.toThrow('DB connection lost');
    });
  });

  describe('identityNameCandidates', () => {
    it('collapses the a_ prefix so both spellings are one identity', () => {
      expect(identityNameCandidates('a_cutie')).toEqual(['a_cutie', 'cutie']);
      expect(identityNameCandidates('cutie')).toEqual(['cutie', 'a_cutie']);
      expect(identityNameCandidates('a_dbb4_aed5')).toEqual(['a_dbb4_aed5', 'dbb4_aed5']);
      expect(identityNameCandidates('cyprianzube')).toEqual(['cyprianzube', 'a_cyprianzube']);
      expect(identityNameCandidates('a_a_x')).toEqual(['a_a_x', 'x', 'a_x']);
    });
  });

  describe('namespace-unified availability', () => {
    it('rejects a name whose other prefix spelling is already taken', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ user_id: 'other123', username: 'a_cutie' });
      const result = await isUsernameAvailable('cutie');
      expect(result).toEqual({ available: false });
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { username: { $in: ['cutie', 'a_cutie'] } },
          { custom_display_name: { $in: ['cutie', 'a_cutie'] } },
        ],
      });
    });

    it('rejects the bare spelling of a default device identity', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ user_id: 'other123', username: 'a_dbb4_aed5' });
      const result = await isUsernameAvailable('dbb4_aed5');
      expect(result).toEqual({ available: false });
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { username: { $in: ['dbb4_aed5', 'a_dbb4_aed5'] } },
          { custom_display_name: { $in: ['dbb4_aed5', 'a_dbb4_aed5'] } },
        ],
      });
    });

    it('still lets the owner reclaim their own name', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ user_id: 'user123', username: 'a_cutie' });
      const result = await isUsernameAvailable('cutie', 'user123');
      expect(result).toEqual({ available: true });
    });
  });

  describe('buildProfileLookupQuery', () => {
    type Doc = Record<string, unknown>;

    function fieldMatches(docValue: unknown, cond: unknown): boolean {
      if (cond !== null && typeof cond === 'object' && !Array.isArray(cond)) {
        const c = cond as { $in?: unknown[]; $regex?: string; $options?: string };
        if (c.$in) return c.$in.includes(docValue);
        if (c.$regex) return new RegExp(c.$regex, c.$options || '').test(String(docValue ?? ''));
        return false;
      }
      return docValue === cond;
    }

    function matches(doc: Doc, query: Record<string, unknown>): boolean {
      const clauses = query.$or as Array<Record<string, unknown>>;
      return clauses.some((clause) => Object.entries(clause).every(([key, cond]) => fieldMatches(doc[key], cond)));
    }

    const deviceA: Doc = { user_id: 'u1', username: 'a_dbb4_aed5', short_username: 'a_dbb4' };
    const deviceB: Doc = { user_id: 'u2', username: 'a_dbb4_7f2c', short_username: 'a_dbb4' };
    const named: Doc = { user_id: 'u3', username: 'cyprianzube' };
    const custom: Doc = { user_id: 'u4', username: 'a_cutie', custom_display_name: 'a_cutie', short_username: 'a_cutie' };

    it('resolves the new unique canonical slug by exact username', () => {
      const query = buildProfileLookupQuery('dbb4_aed5');
      expect(query.$or).toContainEqual({ username: 'a_dbb4_aed5' });
      expect(matches(deviceA, query)).toBe(true);
      expect(matches(deviceB, query)).toBe(false);
    });

    it('resolves the legacy 4-character alias through short_username', () => {
      const query = buildProfileLookupQuery('dbb4');
      expect(query.$or).toContainEqual({ short_username: 'a_dbb4' });
      expect(matches(deviceA, query)).toBe(true);
    });

    it('resolves the same account from every historical spelling', () => {
      for (const slug of ['dbb4_aed5', 'a_dbb4_aed5', 'dbb4', 'a_dbb4']) {
        expect(matches(deviceA, buildProfileLookupQuery(slug))).toBe(true);
      }
    });

    it('resolves named and custom accounts', () => {
      expect(matches(named, buildProfileLookupQuery('cyprianzube'))).toBe(true);
      expect(matches(custom, buildProfileLookupQuery('cutie'))).toBe(true);
      expect(matches(custom, buildProfileLookupQuery('a_cutie'))).toBe(true);
    });
  });

  describe('recordUsernameChange', () => {
    it('creates a UsernameHistory entry for the new username', async () => {
      await recordUsernameChange('user123', 'new_handle', 'old_handle');
      expect(UsernameHistory.create).toHaveBeenCalledTimes(2);
      expect(UsernameHistory.create).toHaveBeenNthCalledWith(1, {
        user_id: 'user123',
        username: 'new_handle',
        custom_display_name: 'new_handle',
        previous_username: 'old_handle',
        released_at: null,
      });
    });

    it('marks the old username as released', async () => {
      await recordUsernameChange('user123', 'new_handle', 'old_handle');
      expect(UsernameHistory.create).toHaveBeenNthCalledWith(2, {
        user_id: 'user123',
        username: 'old_handle',
        custom_display_name: 'old_handle',
        previous_username: null,
        released_at: expect.any(Date),
      });
    });

    it('only creates one entry when oldUsername is null (first-time setup)', async () => {
      await recordUsernameChange('user123', 'first_handle', null);
      expect(UsernameHistory.create).toHaveBeenCalledTimes(1);
      expect(UsernameHistory.create).toHaveBeenCalledWith({
        user_id: 'user123',
        username: 'first_handle',
        custom_display_name: 'first_handle',
        previous_username: null,
        released_at: null,
      });
    });

    it('does not create a release entry when oldUsername is null', async () => {
      await recordUsernameChange('user123', 'first_handle', null);
      const calls = vi.mocked(UsernameHistory.create).mock.calls;
      const hasReleaseEntry = calls.some((call) => {
        const params = call[0] as Record<string, unknown>;
        return params.released_at !== null;
      });
      expect(hasReleaseEntry).toBe(false);
    });

    it('sets released_at to current date for old username', async () => {
      const before = Date.now();
      await recordUsernameChange('user123', 'new', 'old');
      const after = Date.now();
      const releaseCall = vi.mocked(UsernameHistory.create).mock.calls[1][0] as Record<string, unknown>;
      const releasedAt = releaseCall.released_at as Date;
      expect(releasedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(releasedAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('propagates DB errors from UsernameHistory.create', async () => {
      vi.mocked(UsernameHistory.create).mockRejectedValue(new Error('Write failed'));
      await expect(recordUsernameChange('user123', 'new', 'old')).rejects.toThrow('Write failed');
    });
  });
});
