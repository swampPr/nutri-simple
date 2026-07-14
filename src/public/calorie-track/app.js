import { showErrMsg } from '../common/utils/set-error.js';
let accessToken = null;
async function changeTodaysCalories(calories) {
    try {
        const res = await fetch('/calories/set', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({ calories }),
        });
        const change = await res.json();
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw change;
        return change;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
async function changeCalorieGoal(goal) {
    try {
        const res = await fetch('/users/set-calorie-goal', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({ goal }),
        });
        const changed = await res.json();
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw changed;
        return changed;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
async function fetchHistory() {
    try {
        const res = await fetch(`/calories/get?days=7`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const calorieHistory = await res.json();
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw calorieHistory;
        return calorieHistory;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
async function tokenRefresh() {
    try {
        const res = await fetch('/auth/refresh', {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        });
        const accessTokenRes = (await res.json());
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw accessTokenRes;
        accessToken = accessTokenRes.accessToken;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
let historyData = [];
let selectedDay = '';
let todayIso = '';
let busy = false;
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DOW_LABELS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const RING_CIRCUMFERENCE = 377;
const DEFAULT_GOAL = 2000;
const summaryCard = document.querySelector('.summary-card');
const ringFill = document.getElementById('calorie-ring-fill');
const caloriesConsumedEl = document.getElementById('calories-consumed');
const goalInlineEl = document.getElementById('calorie-goal-inline');
const dayLabelEl = document.getElementById('summary-day-label');
const badgeEl = document.getElementById('summary-badge');
const goalStatEl = document.getElementById('calorie-goal');
const foodStatEl = document.getElementById('calories-food');
const remainingStatEl = document.getElementById('calories-remaining');
const addFoodField = document.getElementById('add-food-field');
const addFoodBtn = document.getElementById('add-food-btn');
const addFoodInput = document.getElementById('add-food-input');
const goalField = document.getElementById('goal-field');
const setGoalBtn = document.getElementById('set-goal-btn');
const goalInput = document.getElementById('goal-input');
const clearDayBtn = document.getElementById('clear-day-btn');
const historyBarsEl = document.getElementById('history-bars');
function toIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function buildSevenDayWindow() {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let offset = -6; offset <= 0; offset++) {
        const d = new Date(today);
        d.setDate(d.getDate() + offset);
        days.push({ iso: toIsoDate(d), date: d });
    }
    return days;
}
function computeStatus(calories, goal) {
    if (goal <= 0)
        return 'empty';
    const ratio = calories / goal;
    if (ratio > 1)
        return 'over';
    if (ratio >= 0.9)
        return 'near';
    return 'under';
}
function fmt(n) {
    return n.toLocaleString();
}
function findEntry(iso) {
    return historyData.find((h) => h.day === iso);
}
function renderHistoryBars() {
    const byDay = new Map(historyData.map((h) => [h.day, h]));
    const days = buildSevenDayWindow();
    const bars = historyBarsEl.querySelectorAll('.history-bar');
    bars.forEach((bar, i) => {
        const { iso, date } = days[i];
        const entry = byDay.get(iso);
        const status = entry
            ? computeStatus(entry.calories, entry.calorieGoal)
            : 'empty';
        bar.dataset.day = iso;
        bar.dataset.status = status;
        const valueEl = bar.querySelector('.history-bar-value');
        const fillEl = bar.querySelector('.history-bar-fill');
        const dowEl = bar.querySelector('.history-bar-dow');
        const daynumEl = bar.querySelector('.history-bar-daynum');
        const btnEl = bar.querySelector('.history-bar-btn');
        valueEl.textContent = entry ? fmt(entry.calories) : '–';
        fillEl.style.height = entry
            ? `${Math.min(entry.calories / entry.calorieGoal, 1) * 100}%`
            : '0%';
        dowEl.textContent = iso === todayIso ? 'Today' : DOW_LABELS[date.getDay()];
        daynumEl.textContent = String(date.getDate()).padStart(2, '0');
        const isActive = iso === selectedDay;
        bar.classList.toggle('active', isActive);
        btnEl.setAttribute('aria-pressed', String(isActive));
    });
}
function getFallbackGoal() {
    if (historyData.length === 0)
        return DEFAULT_GOAL;
    // Latest known goal. No endpoint returns the goal standalone, so for a
    // day with no logged row we fall back to the most recent one we've seen.
    return historyData[historyData.length - 1].calorieGoal;
}
function badgeText(entry, status) {
    if (!entry)
        return 'No log yet';
    switch (status) {
        case 'over':
            return `${fmt(entry.calories - entry.calorieGoal)} over goal`;
        case 'near':
            return 'Close to goal';
        default:
            return `${fmt(entry.calorieGoal - entry.calories)} to go`;
    }
}
function dayLabel(iso) {
    if (iso === todayIso)
        return 'Today';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return FULL_DOW_LABELS[date.getDay()];
}
function renderSummary(iso) {
    const entry = findEntry(iso);
    const calories = entry?.calories ?? 0;
    const goal = entry?.calorieGoal ?? getFallbackGoal();
    const status = entry ? computeStatus(calories, goal) : 'under';
    const ratio = goal > 0 ? Math.min(calories / goal, 1) : 0;
    ringFill.setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE * (1 - ratio)));
    summaryCard.dataset.status = status;
    dayLabelEl.textContent = dayLabel(iso);
    badgeEl.textContent = badgeText(entry, status);
    caloriesConsumedEl.textContent = fmt(calories);
    goalInlineEl.textContent = fmt(goal);
    goalStatEl.innerHTML = `${fmt(goal)}<span class="stat-unit">kcal</span>`;
    foodStatEl.innerHTML = `${fmt(calories)}<span class="stat-unit">kcal</span>`;
    const remaining = goal - calories;
    remainingStatEl.dataset.negative = String(remaining < 0);
    remainingStatEl.innerHTML =
        remaining >= 0
            ? `${fmt(remaining)}<span class="stat-unit">kcal</span>`
            : `${fmt(Math.abs(remaining))}<span class="stat-unit">kcal over</span>`;
}
function updateActionAvailability() {
    const isToday = selectedDay === todayIso;
    const locked = !isToday || busy;
    [addFoodBtn, setGoalBtn, clearDayBtn].forEach((btn) => {
        btn.disabled = locked;
        btn.title = isToday ? '' : 'Only today can be edited';
    });
    if (!isToday) {
        closeEditor(addFoodField);
        closeEditor(goalField);
    }
}
function openEditor(field, input, prefill = '') {
    // Only one editor open at a time
    closeEditor(addFoodField);
    closeEditor(goalField);
    field.classList.add('is-editing');
    input.value = prefill;
    input.focus();
    input.select();
}
function closeEditor(field) {
    field.classList.remove('is-editing');
    const input = field.querySelector('.calorie-editor-input');
    if (input)
        input.value = '';
}
async function refreshHistory() {
    const res = await fetchHistory();
    if (!res?.calorieHistory)
        return;
    historyData = res.calorieHistory;
    todayIso = buildSevenDayWindow()[6].iso;
    if (!selectedDay)
        selectedDay = todayIso;
    renderHistoryBars();
    renderSummary(selectedDay);
    updateActionAvailability();
}
async function mutate(fn) {
    if (busy)
        return;
    busy = true;
    updateActionAvailability();
    try {
        await fn();
        await refreshHistory();
    }
    finally {
        busy = false;
        updateActionAvailability();
    }
}
historyBarsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.history-bar-btn');
    if (!btn)
        return;
    const bar = btn.closest('.history-bar');
    if (!bar?.dataset.day)
        return;
    selectedDay = bar.dataset.day;
    renderHistoryBars();
    renderSummary(selectedDay);
    updateActionAvailability();
});
addFoodBtn.addEventListener('click', () => openEditor(addFoodField, addFoodInput));
addFoodInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEditor(addFoodField);
        addFoodBtn.focus();
        return;
    }
    if (e.key !== 'Enter')
        return;
    const amount = Number(addFoodInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
        showErrMsg('main-error', 'Enter a calorie amount greater than 0.');
        return;
    }
    const current = findEntry(todayIso)?.calories ?? 0;
    closeEditor(addFoodField);
    void mutate(() => changeTodaysCalories(current + amount));
});
addFoodInput.addEventListener('blur', () => closeEditor(addFoodField));
setGoalBtn.addEventListener('click', () => {
    const current = findEntry(todayIso)?.calorieGoal ?? getFallbackGoal();
    openEditor(goalField, goalInput, String(current));
});
goalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEditor(goalField);
        setGoalBtn.focus();
        return;
    }
    if (e.key !== 'Enter')
        return;
    const goal = Number(goalInput.value);
    if (!Number.isFinite(goal) || goal <= 0) {
        showErrMsg('main-error', 'Enter a calorie goal greater than 0.');
        return;
    }
    closeEditor(goalField);
    void mutate(() => changeCalorieGoal(goal));
});
goalInput.addEventListener('blur', () => closeEditor(goalField));
clearDayBtn.addEventListener('click', () => {
    const current = findEntry(todayIso)?.calories ?? 0;
    if (current === 0) {
        showErrMsg('main-error', 'Nothing logged today to clear.');
        return;
    }
    if (!window.confirm(`Clear today's ${fmt(current)} kcal? This can't be undone.`))
        return;
    void mutate(() => changeTodaysCalories(0));
});
tokenRefresh().then(() => refreshHistory());
