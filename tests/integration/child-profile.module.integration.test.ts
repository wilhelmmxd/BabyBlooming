/**
 * Integration: validate → transform pipeline against real `lib/child-profile` exports
 * (cross-function contract; still no I/O).
 */

import { validateChildProfile, transformChildData } from '@/lib/child-profile';

describe('child-profile module integration', () => {
    it('validates then transforms a profile for persistence shape', () => {
        const profile = { name: 'River', dob: '2021-04-01', gender: 'non-binary' };
        const v = validateChildProfile(profile);
        expect(v).toEqual({ isValid: true });

        const row = transformChildData(profile, 'parent-uid-1');
        expect(row).toMatchObject({
            name: 'River',
            dob: '2021-04-01',
            gender: 'non-binary',
            parentId: 'parent-uid-1',
            active: true,
        });
        expect(JSON.parse(JSON.stringify(row))).toEqual(row);
    });
});
