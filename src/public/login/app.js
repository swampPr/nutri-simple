"use strict";
const toggleBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');
const toggleIcon = toggleBtn?.querySelector('.material-symbols-rounded') ?? null;
if (toggleBtn && passwordInput && toggleIcon) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggleIcon.textContent = isHidden ? 'visibility_off' : 'visibility';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
}
