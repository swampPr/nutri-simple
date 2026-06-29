const toggleBtn = document.getElementById('toggle-password') as HTMLButtonElement | null;
const passwordInput = document.getElementById('password') as HTMLInputElement | null;
const toggleIcon = toggleBtn?.querySelector<HTMLElement>('.material-symbols-rounded') ?? null;

if (toggleBtn && passwordInput && toggleIcon) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggleIcon.textContent = isHidden ? 'visibility_off' : 'visibility';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
}
