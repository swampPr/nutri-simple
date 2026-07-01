import { ConflictExceptionResponse } from '../common/types/exceptions';
import { RegisteredUser } from '../common/types/user';
import { showErrMsg } from '../common/utils/set-error';

const toggleBtn = document.getElementById('toggle-password') as HTMLButtonElement | null;
const passwordInput = document.getElementById('password') as HTMLInputElement | null;
const toggleIcon = toggleBtn?.querySelector<HTMLElement>('.material-symbols-rounded') ?? null;
const form = document.getElementById('register-form') as HTMLFormElement | null;
if (!form) showErrMsg('register-error', 'Unexpected error occurred, please try again');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData(form);

        const res = await fetch('/auth/register', {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                userName: formData.get('userName'),
                password: formData.get('password'),
            }),
        });

        const responseJSON = (await res.json()) as RegisteredUser | ConflictExceptionResponse;
        if (!res.ok) throw responseJSON as ConflictExceptionResponse;

        window.location.href = '/login';
    } catch (err: any) {
        return showErrMsg('register-error', err.message);
    }
});

if (toggleBtn && passwordInput && toggleIcon) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggleIcon.textContent = isHidden ? 'visibility_off' : 'visibility';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
}

export {};
