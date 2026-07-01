import { AccessTokenResponse } from '../common/types/accessToken';
import { UnauthorizedExceptionResponse } from '../common/types/exceptions';
import { showErrMsg } from '../common/utils/set-error.js';

const toggleBtn = document.getElementById('toggle-password') as HTMLButtonElement | null;
const passwordInput = document.getElementById('password') as HTMLInputElement | null;
const toggleIcon = toggleBtn?.querySelector<HTMLElement>('.material-symbols-rounded') ?? null;
const form = document.getElementById('login-form') as HTMLFormElement | null;
if (!form)
    document.getElementById('login-error')!.textContent =
        'Unexpected error occurred, please try again';

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData(form);
        const res = await fetch('/auth/login', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                userName: formData.get('userName'),
                password: formData.get('password'),
            }),
        });
        const responseJSON = (await res.json()) as
            | AccessTokenResponse
            | UnauthorizedExceptionResponse;
        if (!res.ok) throw responseJSON as UnauthorizedExceptionResponse;

        window.location.href = '/dashboard';
    } catch (err: any) {
        return showErrMsg('login-error', err.message);
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
