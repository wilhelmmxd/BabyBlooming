/** @jest-environment jsdom */

/**
 * Integration: FirstChildSetup dialog with mocked auth/children/toast (no Firebase).
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstChildSetup } from '@/components/first-child-setup';
import { useChildren } from '@/lib/children-context';
import { useAuth } from '@/lib/auth-context';

const mockAddChild = jest.fn().mockResolvedValue(undefined);
const mockToast = jest.fn();

jest.mock('@/lib/auth-context', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/lib/children-context', () => ({
    useChildren: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: mockToast }),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseChildren = useChildren as jest.MockedFunction<typeof useChildren>;

describe('FirstChildSetup (integration)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAuth.mockReturnValue({
            user: { uid: 'test-user' } as any,
            loading: false,
            login: jest.fn(),
            signup: jest.fn(),
            logout: jest.fn(),
            loginWithGoogle: jest.fn(),
        });
        mockedUseChildren.mockReturnValue({
            children: [],
            loading: false,
            activeChild: null,
            setActiveChild: jest.fn(),
            addChild: mockAddChild,
            deleteChild: jest.fn(),
            editChild: jest.fn(),
        });
    });

    it('opens the welcome dialog when user is signed in and has no children', async () => {
        render(<FirstChildSetup />);
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Welcome to Baby Blooming!')).toBeInTheDocument();
    });

    it('shows validation when name is empty on submit', async () => {
        const user = userEvent.setup();
        render(<FirstChildSetup />);
        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: /add child/i }));

        await waitFor(() => {
            expect(screen.getByText("Please enter your child's name")).toBeInTheDocument();
        });
        expect(mockAddChild).not.toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Validation Error',
                variant: 'destructive',
            }),
        );
    });

    it('submits name and optional birth date and sex via addChild', async () => {
        const user = userEvent.setup();
        render(<FirstChildSetup />);
        await screen.findByRole('dialog');

        await user.type(screen.getByLabelText(/child's name/i), 'Emma');
        await user.type(screen.getByLabelText(/birth date/i), '2023-06-01');
        await user.click(screen.getByRole('radio', { name: /^female$/i }));

        await user.click(screen.getByRole('button', { name: /add child/i }));

        await waitFor(() => {
            expect(mockAddChild).toHaveBeenCalledWith('Emma', '2023-06-01', 'female');
        });
        expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Success',
            }),
        );
    });

    it('rejects a future birth date', async () => {
        const user = userEvent.setup();
        render(<FirstChildSetup />);
        await screen.findByRole('dialog');

        const future = `${new Date().getFullYear() + 2}-01-01`;
        await user.type(screen.getByLabelText(/child's name/i), 'Test');
        const birthInput = screen.getByLabelText(/birth date/i);
        await user.clear(birthInput);
        await user.type(birthInput, future);

        await user.click(screen.getByRole('button', { name: /add child/i }));

        await waitFor(() => {
            expect(screen.getByText('Birth date cannot be in the future')).toBeInTheDocument();
        });
        expect(mockAddChild).not.toHaveBeenCalled();
    });
});
