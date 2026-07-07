import { showErrMsg } from '../common/utils/set-error.js';
const toggleBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');
const toggleIcon = toggleBtn?.querySelector('.material-symbols-rounded') ?? null;
const form = document.getElementById('register-form');
if (!form)
    showErrMsg('register-error', 'Unexpected error occurred, please try again');
form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(form);
        const res = await fetch('/auth/register', {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                userName: formData.get('userName'),
                password: formData.get('password'),
            }),
        });
        const responseJSON = (await res.json());
        if (!res.ok)
            throw responseJSON;
        window.location.href = '/login';
    }
    catch (err) {
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
