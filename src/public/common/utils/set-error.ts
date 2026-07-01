export function showErrMsg(id: string, errorMsg: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = errorMsg;
}
