/**
 * Unit tests for `lib/child-profile.ts`.
 */

import {
    validateChildProfile,
    transformChildData,
    type ChildProfile,
} from '@/lib/child-profile';

describe('validateChildProfile', () => {
    const base = {
        name: 'Baby Riley',
        dob: '2020-06-15',
        gender: 'non-binary',
    };

    describe('payload guard (null / non-object)', () => {
        it('rejects null data', () => {
            expect(validateChildProfile(null as unknown as ChildProfile)).toEqual({
                isValid: false,
                error: 'Child profile data is required.',
            });
        });

        it('rejects undefined data', () => {
            expect(validateChildProfile(undefined as unknown as ChildProfile)).toEqual({
                isValid: false,
                error: 'Child profile data is required.',
            });
        });

        it('rejects non-object primitives', () => {
            expect(validateChildProfile('oops' as unknown as ChildProfile).isValid).toBe(false);
            expect(validateChildProfile(42 as unknown as ChildProfile).isValid).toBe(false);
        });
    });

    describe('name', () => {
        it('accepts a normal name', () => {
            expect(validateChildProfile(base).isValid).toBe(true);
        });

        it('rejects missing name (undefined) — runtime callers may bypass TypeScript', () => {
            const data = { ...base, name: undefined as unknown as string };
            const r = validateChildProfile(data);
            expect(r).toEqual({ isValid: false, error: 'Child name or initials are required.' });
        });

        it('rejects null name', () => {
            const data = { ...base, name: null as unknown as string };
            expect(validateChildProfile(data).isValid).toBe(false);
        });

        it('rejects empty string name', () => {
            expect(validateChildProfile({ ...base, name: '' }).isValid).toBe(false);
        });

        it('rejects whitespace-only name', () => {
            expect(validateChildProfile({ ...base, name: '   \t\n  ' }).isValid).toBe(false);
        });

        it('accepts name with leading/trailing spaces (trim does not reject; only empty after trim)', () => {
            const r = validateChildProfile({ ...base, name: '  Alex  ' });
            expect(r.isValid).toBe(true);
        });

        it('coerces numeric name at runtime to string (no throw)', () => {
            const data = { ...base, name: 42 as unknown as string };
            expect(validateChildProfile(data).isValid).toBe(true);
        });

        it('accepts only zero-width space as name (trim does not strip U+200B — invisible “empty” risk)', () => {
            const r = validateChildProfile({ ...base, name: '\u200B' });
            expect(r.isValid).toBe(true);
        });

        it('accepts very long name (no max-length rule in helper)', () => {
            const long = 'a'.repeat(5000);
            expect(validateChildProfile({ ...base, name: long }).isValid).toBe(true);
        });
    });

    describe('date of birth — presence & parse', () => {
        it('rejects missing dob (undefined)', () => {
            const data = { ...base, dob: undefined as unknown as string };
            expect(validateChildProfile(data)).toEqual({
                isValid: false,
                error: 'Date of birth is required.',
            });
        });

        it('rejects null dob', () => {
            const data = { ...base, dob: null as unknown as string };
            expect(validateChildProfile(data).isValid).toBe(false);
        });

        it('rejects empty dob', () => {
            expect(validateChildProfile({ ...base, dob: '' }).isValid).toBe(false);
        });

        it('rejects whitespace-only dob', () => {
            expect(validateChildProfile({ ...base, dob: '  ' }).isValid).toBe(false);
        });

        it('rejects completely invalid date string', () => {
            const r = validateChildProfile({ ...base, dob: 'not-a-date' });
            expect(r).toEqual({ isValid: false, error: 'Date of birth is not a valid date.' });
        });

        it('rejects non-existent month in ISO date (JS Date is NaN)', () => {
            // Note: '2020-02-31' is normalized by JS to Mar 2 — not NaN — so we use an impossible month.
            const r = validateChildProfile({ ...base, dob: '2020-13-01' });
            expect(r).toEqual({ isValid: false, error: 'Date of birth is not a valid date.' });
        });

        it('accepts ISO date-only (YYYY-MM-DD)', () => {
            expect(validateChildProfile({ ...base, dob: '2019-01-01' }).isValid).toBe(true);
        });

        it('accepts a very old but valid DOB (historical record)', () => {
            expect(validateChildProfile({ ...base, dob: '1900-01-01' }).isValid).toBe(true);
        });

        it('accepts leap day on a leap year', () => {
            expect(validateChildProfile({ ...base, dob: '2020-02-29' }).isValid).toBe(true);
        });

        it('parses Feb 29 on non-leap year per JS Date (normalized, not NaN) — document behavior', () => {
            const r = validateChildProfile({ ...base, dob: '2021-02-29' });
            // V8 normalizes to a real instant; helper treats as valid if parse succeeds and not future.
            expect(r.isValid).toBe(true);
        });

        it('accepts common US-style slash date when parseable', () => {
            expect(validateChildProfile({ ...base, dob: '02/15/2020' }).isValid).toBe(true);
        });

        it('rejects ambiguous EU-style day-first if engine cannot parse (document regional risk)', () => {
            const r = validateChildProfile({ ...base, dob: '15/02/2020' });
            expect(r).toEqual({ isValid: false, error: 'Date of birth is not a valid date.' });
        });

        it('accepts DOB as past Unix timestamp (ms) — runtime JSON may send number', () => {
            const ms = new Date('2018-05-01T00:00:00.000Z').getTime();
            const data = { ...base, dob: ms as unknown as string };
            expect(validateChildProfile(data).isValid).toBe(true);
        });

        it('accepts DOB numeric 0 (Unix epoch) as a past instant', () => {
            const data = { ...base, dob: 0 as unknown as string };
            expect(validateChildProfile(data).isValid).toBe(true);
        });

        it('rejects string dob "Infinity" / "NaN" (unparseable)', () => {
            expect(validateChildProfile({ ...base, dob: 'Infinity' })).toEqual({
                isValid: false,
                error: 'Date of birth is not a valid date.',
            });
            expect(validateChildProfile({ ...base, dob: 'NaN' })).toEqual({
                isValid: false,
                error: 'Date of birth is not a valid date.',
            });
        });

        it('accepts full ISO-8601 datetime string in the past', () => {
            expect(validateChildProfile({ ...base, dob: '2019-06-15T14:30:00.000Z' }).isValid).toBe(true);
        });
    });

    describe('date of birth — future / now (deterministic via fake timers)', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('rejects DOB clearly in the future', () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-04-07T12:00:00.000Z'));
            const r = validateChildProfile({ ...base, dob: '2030-01-01' });
            expect(r).toEqual({ isValid: false, error: 'Date of birth cannot be in the future.' });
        });

        it('accepts DOB in the past relative to mocked now', () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-04-07T12:00:00.000Z'));
            expect(validateChildProfile({ ...base, dob: '2025-01-01' }).isValid).toBe(true);
        });

        it('rejects DOB one second after mocked now', () => {
            jest.useFakeTimers();
            const now = new Date('2026-04-07T12:00:00.000Z');
            jest.setSystemTime(now);
            const future = new Date(now.getTime() + 1000);
            const iso = future.toISOString();
            const r = validateChildProfile({ ...base, dob: iso });
            expect(r.isValid).toBe(false);
        });

        it('accepts DOB exactly equal to mocked now (boundary: not strictly after now)', () => {
            jest.useFakeTimers();
            const now = new Date('2026-04-07T12:00:00.000Z');
            jest.setSystemTime(now);
            const r = validateChildProfile({ ...base, dob: now.toISOString() });
            expect(r.isValid).toBe(true);
        });
    });

    describe('gender', () => {
        it('does not fail validation when gender is empty (not validated by this helper)', () => {
            const r = validateChildProfile({ ...base, gender: '' });
            expect(r.isValid).toBe(true);
        });

        it('accepts arbitrary gender string (no enum check in helper)', () => {
            expect(validateChildProfile({ ...base, gender: 'anything' }).isValid).toBe(true);
        });

        it('accepts missing gender key (undefined) when name and dob valid', () => {
            const { gender: _g, ...noGender } = base;
            expect(validateChildProfile(noGender as ChildProfile).isValid).toBe(true);
        });
    });

    describe('integration-style: valid profile end-to-end', () => {
        it('returns only isValid: true with no error property on success', () => {
            const r = validateChildProfile(base);
            expect(r).toEqual({ isValid: true });
        });
    });
});

describe('transformChildData', () => {
    const profile: ChildProfile = {
        name: 'Sam',
        dob: '2021-03-01',
        gender: 'female',
    };

    it('adds parentId, createdAt, and active without dropping original fields', () => {
        const parentId = 'uid_abc';
        const out = transformChildData(profile, parentId);
        expect(out).toMatchObject({
            name: 'Sam',
            dob: '2021-03-01',
            gender: 'female',
            parentId,
            active: true,
        });
        expect(out.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(() => new Date(out.createdAt).getTime()).not.toBeNaN();
    });

    it('uses the provided parentId exactly (including empty string — caller should validate auth uid)', () => {
        const out = transformChildData(profile, '');
        expect(out.parentId).toBe('');
    });

    it('does not mutate the input object', () => {
        const copy = { ...profile };
        transformChildData(copy, 'p1');
        expect(copy).toEqual(profile);
    });

    it('produces a new createdAt on each call', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        const a = transformChildData(profile, 'u1').createdAt;
        jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
        const b = transformChildData(profile, 'u1').createdAt;
        expect(a).not.toBe(b);
        jest.useRealTimers();
    });

    it('preserves unicode in name when transforming', () => {
        const p: ChildProfile = { name: '宝宝', dob: '2022-01-01', gender: 'female' };
        expect(transformChildData(p, 'uid').name).toBe('宝宝');
    });

    it('passes through extra enumerable fields on data (runtime — sanitize before Firestore if needed)', () => {
        const wide = { ...profile, photoUrl: 'https://x' } as ChildProfile & { photoUrl: string };
        const out = transformChildData(wide as ChildProfile, 'uid');
        expect(out).toMatchObject({ photoUrl: 'https://x', parentId: 'uid' });
    });

    it('allows null parentId at runtime (TypeScript says string — document for Firestore)', () => {
        const out = transformChildData(profile, null as unknown as string);
        expect(out.parentId).toBeNull();
    });

    it('allows undefined parentId at runtime', () => {
        const out = transformChildData(profile, undefined as unknown as string);
        expect(out.parentId).toBeUndefined();
    });

    it('overwrites a pre-existing parentId on spread input (last wins)', () => {
        const rogue = { ...profile, parentId: 'evil' };
        const out = transformChildData(rogue as ChildProfile, 'canonical-uid');
        expect(out.parentId).toBe('canonical-uid');
    });
});
