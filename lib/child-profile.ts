/**
 * Child profile validation and Firestore-oriented transforms.
 * Shared by unit tests and (when wired) first-child / edit flows.
 */

export interface ChildProfile {
    name: string;
    dob: string;
    gender: string;
}

export type ValidateChildProfileResult =
    | { isValid: true }
    | { isValid: false; error: string };

/**
 * Validates child profile input (name, parsable DOB, not in the future).
 * Uses String() for name/dob so runtime values that bypass TypeScript (number, etc.) do not throw.
 */
export const validateChildProfile = (data: ChildProfile): ValidateChildProfileResult => {
    if (data == null || typeof data !== 'object') {
        return { isValid: false, error: 'Child profile data is required.' };
    }

    const nameStr = data.name == null ? '' : String(data.name);
    if (nameStr.trim() === '') {
        return { isValid: false, error: 'Child name or initials are required.' };
    }

    if (data.dob === undefined || data.dob === null || String(data.dob).trim() === '') {
        return { isValid: false, error: 'Date of birth is required.' };
    }

    const birthDate = new Date(data.dob as string | number | Date);
    if (Number.isNaN(birthDate.getTime())) {
        return { isValid: false, error: 'Date of birth is not a valid date.' };
    }

    if (birthDate.getTime() > Date.now()) {
        return { isValid: false, error: 'Date of birth cannot be in the future.' };
    }

    return { isValid: true };
};

export const transformChildData = (data: ChildProfile, parentId: string) => ({
    ...data,
    parentId,
    createdAt: new Date().toISOString(),
    active: true,
});
