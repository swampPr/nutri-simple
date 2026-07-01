export function showErrMsg(id, errorMsg) {
    const el = document.getElementById(id);
    if (!el)
        return;
    el.textContent = errorMsg;
}
