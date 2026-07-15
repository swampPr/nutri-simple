import { AccessTokenResponse } from '../common/types/accessToken';
import { CalorieHistory } from '../common/types/calorieHistory';
import { AlertItem } from '../common/types/alertsItem';
import { Condition } from '../common/types/condition';
import { BadRequestExceptionResponse } from '../common/types/exceptions';
import { UserForecast } from '../common/types/forecast';
import { Latitude, Longitude } from '../common/types/geo';
import { UserRecipes } from '../common/types/userRecipes';
import { conditionIcons } from '../common/utils/condition-icons.js';
import { showErrMsg } from '../common/utils/set-error.js';

let accessToken: string | null = null;
const weatherError = document.getElementById('weather-error');
const weatherRefreshBtn = document.getElementById('weather-refresh-btn') as HTMLButtonElement;

const manualLocationBtn = document.getElementById('manual-location-btn') as HTMLButtonElement;

const autocompleteList = document.getElementById('manual-location-results');
const manualLocationPopover = document.getElementById('manual-location-popover') as HTMLDivElement;
const manualLocationInput = document.getElementById('manual-location-input') as HTMLInputElement;
const locateBtn = document.getElementById('weather-locate-btn') as HTMLButtonElement;
const currentCalories = { consumed: 0, goal: 0 };
const logoutLink = document.getElementById('logout-link') as HTMLAnchorElement;

const severityIcon: Record<string, string> = {
    Extreme: 'crisis_alert',
    Severe: 'warning',
    Moderate: 'error',
    Minor: 'info',
    Unknown: 'help',
};

logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();

    await fetch('/auth/logout', {
        headers: {
            Accept: 'application/json',
        },
        method: 'POST',
        credentials: 'include',
    });
    return (window.location.href = '/login');
});

manualLocationBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = manualLocationPopover.hidden;
    manualLocationPopover.hidden = !isHidden;
    if (isHidden) manualLocationInput.focus();
});

weatherRefreshBtn.addEventListener('click', async () => {
    weatherRefreshBtn.disabled = true;
    weatherRefreshBtn.classList.add('is-loading');

    const headers = new Headers({
        Authorization: `Bearer ${accessToken} `,
        Accept: 'application/json',
    });
    const { lat, lon } = await fetchUserLocation();

    const userForecast = await fetchWeather(lat, lon, headers);

    renderWeather(userForecast);
});

document.addEventListener('click', (e) => {
    if (
        !manualLocationPopover.hidden &&
        !manualLocationPopover.contains(e.target as Node) &&
        !manualLocationBtn.contains(e.target as Node)
    ) {
        manualLocationPopover.hidden = true;
    }
});

manualLocationInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        manualLocationPopover.hidden = true;
        manualLocationBtn.focus();
    }
});

let debounceTimer: any;
let abortController: AbortController | null = null;

manualLocationInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    abortController?.abort();

    const value = (e.target! as HTMLInputElement).value.trim();
    if (!value) {
        autocompleteList!.innerHTML = '';
        return;
    }

    debounceTimer = setTimeout(async () => {
        abortController = new AbortController();
        try {
            const res = await fetch(`/location/autocomplete?q=${value}`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken} `,
                },
                credentials: 'include',
                signal: abortController.signal,
            });
            const suggestions = await res.json();
            if (res.status === 401) return (window.location.href = '/login');
            if (!res.ok) throw suggestions;

            return renderAutocomplete(suggestions);
        } catch (err: any) {
            //NOTE: If the exception is an AbbortError then ignore it
            if (err instanceof DOMException || err.message === 'The operation was aborted.') return;

            return showErrMsg('main-error', err.message);
        }
    }, 300);
});

function renderAutocomplete(suggestions: { name: string }[]) {
    autocompleteList!.classList.add('autocomplete-list');
    autocompleteList!.innerHTML = '';

    const autocompleteListItems = suggestions.map((i) => {
        const li = document.createElement('li');
        li.classList.add('autocomplete-list-item');

        li.textContent = i.name;
        return li;
    });

    autocompleteList?.append(...autocompleteListItems);
}

async function fetchWeather(lat: Latitude, lon: Longitude, reqHeaders?: Headers) {
    const headers =
        reqHeaders ??
        new Headers({
            Authorization: `Bearer ${accessToken} `,
            Accept: 'application/json',
            'X-Cache': 'true',
        });

    try {
        const res = await fetch(`/weather/forecast?lat=${lat}&lon=${lon}`, {
            headers,
            credentials: 'include',
        });

        const responseJSON = await res.json();

        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw responseJSON;

        return responseJSON;
    } catch (err: any) {
        return showErrMsg('weather-error', err.message);
    }
}

function getConditionIcon(summary: Condition) {
    return conditionIcons[summary];
}

function getScoreTone(score: number): 'good' | 'fair' | 'poor' {
    if (score >= 7) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
}
function getScoreCaption(tone: 'good' | 'fair' | 'poor', alerts?: AlertItem | undefined): string {
    if (alerts) return 'Adverse weather occurring or expected. Best to stay indoors';
    switch (tone) {
        case 'good':
            return 'Great conditions to run';
        case 'fair':
            return 'Decent weather for a run';
        case 'poor':
            return 'Not ideal, consider staying inside';
    }
}

function getSeverityIcon(severity: string): string {
    return severityIcon[severity] ?? severityIcon.Unknown;
}

function formatAlertTime(unixSeconds: number): string {
    return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function renderWeatherAlerts(alerts?: AlertItem[]) {
    const container = document.getElementById('weather-alerts');
    const list = document.getElementById('weather-alerts-list');
    if (!container || !list) return;

    list.innerHTML = '';

    if (!alerts || alerts.length === 0) {
        container.hidden = true;
        return;
    }

    const items = alerts.map((alert) => {
        const li = document.createElement('li');
        li.className = `weather-alert-item weather-alert-item--${alert.severity.toLowerCase()}`;

        const expiresNum = Number(alert.expires);
        const expiresText = !expiresNum || expiresNum === -999 ? null : formatAlertTime(expiresNum);

        li.innerHTML = `
            <span class="material-symbols-rounded">${getSeverityIcon(alert.severity)}</span>
            <div class="weather-alert-content">
                <div class="weather-alert-top">
                    <p class="weather-alert-title">${alert.title}</p>
                    <span class="weather-alert-badge">${alert.severity}</span>
                </div>
                <p class="weather-alert-desc">${alert.description}</p>
                <p class="weather-alert-times">
                    Issued ${formatAlertTime(alert.time)}${expiresText ? ` · Expires ${expiresText}` : ''}
                </p>
            </div>
        `;
        return li;
    });

    list.append(...items);
    container.hidden = false;
}

function renderWeather(userForecast: UserForecast) {
    document.getElementById('weather-header-temp')!.hidden = true;

    const root = document.getElementById('weather-render-root')!;
    root.innerHTML = '';

    const conditionIcon = getConditionIcon(userForecast.currently.icon as Condition);

    const score = userForecast.currently.runningScore;
    const tone = getScoreTone(score);

    const hero = document.createElement('div');
    hero.className = 'weather-hero';
    hero.innerHTML = `
    <div class="weather-hero-main">
        <span class="material-symbols-rounded weather-icon-large">${conditionIcon}</span>
        <div class="weather-hero-info">
            <p class="weather-location">${userForecast.locationName}</p>
            <p class="weather-temp">${Math.round(userForecast.currently.temperature)}°C</p>
            <p class="weather-summary">${userForecast.currently.summary} · Feels like ${Math.round(userForecast.currently.apparentTemperature)}</p>
        </div>
    </div>
    <div class="running-score" data-tone="${tone}" style="--pct:${Math.max(0, Math.min(score, 10)) * 10}">
        <div class="running-score-badge">
        
            <span class="material-symbols-rounded running-score-badge-icon">directions_run</span>
            <span class="running-score-badge-text">Running Score</span>
        </div>
        <div class="running-score-gauge">
            <div class="running-score-value">
                <span>${score}</span><small>/10</small>
            </div>
        </div>
        <p class="running-score-caption">${userForecast.alerts.length > 0 ? 'Adverse weather expected or occurring. Stay safe' : getScoreCaption(tone)}</p>
    </div>
`;
    const stats = document.createElement('div');
    stats.className = 'weather-stats';
    const statDefs = [
        {
            icon: 'humidity_percentage',
            label: 'Humidity',
            value: `${Math.round(userForecast.currently.humidity * 100)}%`,
        },
        {
            icon: 'dew_point',
            label: 'Dew Point',
            value: `${Math.round(userForecast.currently.dewPoint)}°C`,
        },
        {
            icon: 'air',
            label: 'Wind Speed',
            value: `${Math.round(userForecast.currently.windSpeed)}KM/H`,
        },
        {
            icon: 'storm',
            label: 'Wind Gusts',
            value: `${Math.round(userForecast.currently.windGust)}KM/H`,
        },
    ];
    stats.innerHTML = statDefs
        .map(
            (s) => `
        <div class="stat-item">
            <span class="material-symbols-rounded">${s.icon}</span>
            <div>
                <p class="stat-label">${s.label}</p>
                <p class="stat-value">${s.value}</p>
            </div>
        </div>`
        )
        .join('');

    const forecastWrap = document.createElement('div');
    forecastWrap.className = 'forecast-wrap';
    forecastWrap.innerHTML = `<p class="forecast-heading">Next 3 hours</p>`;

    const next3HoursList = document.createElement('ul');
    next3HoursList.classList.add('forecast-list');

    const listItems = userForecast.next3HoursSummary.map((forecast) => {
        const li = document.createElement('li');
        const date = new Date(forecast.time! * 1000);

        const time = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        li.classList.add('forecast-list-item');
        li.innerHTML = `
            <span class="material-symbols-rounded">${getConditionIcon(forecast.icon as Condition)}</span>
            <p class="forecast-time">${time}</p>
            <p class="forecast-temp">${Math.round(forecast.temperature!)}°C</p>
            <p class="forecast-detail">${Math.round(forecast.humidity! * 100)}% hum.</p>
            <p class="forecast-detail forecast-prob">${Math.round(forecast.precipProbability!)}% rain</p>
        `;
        return li;
    });
    next3HoursList.append(...listItems);
    forecastWrap.append(next3HoursList);

    weatherRefreshBtn.hidden = false;
    weatherRefreshBtn.disabled = false;
    weatherRefreshBtn.classList.remove('is-loading');

    if (userForecast.alerts) renderWeatherAlerts(userForecast.alerts);

    root.append(hero, stats, forecastWrap);
    locateBtn.hidden = true;
}

async function changeTodaysCalories(calories: number) {
    try {
        const res = await fetch('/calories/set', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ calories }),
            credentials: 'include',
        });
        const change = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw change;

        return change;
    } catch (err: any) {
        showErrMsg('calorie-error', err.message);
    }
}

async function changeCalorieGoal(goal: number) {
    try {
        const res = await fetch('/users/set-calorie-goal', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },

            method: 'POST',
            body: JSON.stringify({ goal }),
            credentials: 'include',
        });
        const changed = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw changed;

        return changed;
    } catch (err: any) {
        showErrMsg('calorie-error', err.message);
    }
}

async function fetchSavedRecipes() {
    try {
        const res = await fetch('/recipes/saved', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const userSavedRecipes = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw userSavedRecipes;

        return userSavedRecipes as UserRecipes;
    } catch (err: any) {
        showErrMsg('recipes-error', err.message);
    }
}

async function fetchTodaysCalories() {
    try {
        const res = await fetch(`/calories/get?days=1`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        let todaysCalories = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (res.status === 400) return todaysCalories;
        if (!res.ok) throw todaysCalories;

        return todaysCalories;
    } catch (err: any) {
        return showErrMsg('calorie-error', err.message);
    }
}

function getCalorieTone(consumed: number, goal: number): 'calorie' | 'poor' {
    return goal > 0 && consumed > goal ? 'poor' : 'calorie';
}

function renderTodaysCalories(todaysCalories: CalorieHistory) {
    document.getElementById('calories-empty-state')!.hidden = true;

    const root = document.getElementById('calorie-render-root')!;
    root.innerHTML = '';

    const userCalories = todaysCalories.calorieHistory[0];
    const consumed = userCalories.calories;
    const goal = userCalories.calorieGoal;
    currentCalories.consumed = consumed;
    currentCalories.goal = goal;
    const remaining = goal - consumed;

    const pct = goal > 0 ? Math.max(0, Math.min((consumed / goal) * 100, 100)) : 0;
    const tone = getCalorieTone(consumed, goal);

    const caption =
        remaining >= 0
            ? `${remaining} kcal remaining today`
            : `${Math.abs(remaining)} kcal over your goal`;

    const summary = document.createElement('div');
    summary.className = 'calorie-summary';
    summary.innerHTML = `
        <div class="running-score" data-tone="${tone}" style="--pct:${pct}">
            <div class="running-score-badge">
                <span class="material-symbols-rounded running-score-badge-icon">local_fire_department</span>
                <span class="running-score-badge-text">Calories</span>
            </div>
            <div class="running-score-gauge">
                <div class="running-score-value">
                    <span>${consumed}</span><small>/${goal}</small>
                </div>
            </div>
            <p class="running-score-caption">${caption}</p>
        </div>
        <div class="calorie-stats">
            <div class="stat-item">
                <span class="material-symbols-rounded">local_fire_department</span>
                <div>
                    <p class="stat-label">Consumed</p>
                    <p class="stat-value">${consumed} kcal</p>
                </div>
            </div>
            <div class="stat-item">
                <span class="material-symbols-rounded">flag</span>
                <div>
                    <p class="stat-label">Goal</p>
                    <p class="stat-value">${goal} kcal</p>
                </div>
            </div>
            <div class="stat-item">
                <span class="material-symbols-rounded">${remaining >= 0 ? 'trending_down' : 'trending_up'}</span>
                <div>
                    <p class="stat-label">${remaining >= 0 ? 'Remaining' : 'Over by'}</p>
                    <p class="stat-value">${Math.abs(remaining)} kcal</p>
                </div>
            </div>
        </div>
    `;

    root.append(summary);
}

interface CalorieFieldConfig {
    buttonId: string;
    placeholder: string;
    icon: string;
}

function renderSavedRecipes(userRecipes: UserRecipes) {
    document.querySelector('#recipes-data-container .empty-state')?.remove();

    const carousel = document.createElement('div');
    carousel.className = 'recipe-carousel';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'recipe-scroll-btn recipe-scroll-btn--prev';
    prevBtn.setAttribute('aria-label', 'Scroll to previous recipes');
    prevBtn.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">chevron_left</span>`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'recipe-scroll-btn recipe-scroll-btn--next';
    nextBtn.setAttribute('aria-label', 'Scroll to next recipes');
    nextBtn.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>`;

    const track = document.createElement('ul');
    track.id = 'recipes-list';
    track.className = 'recipe-track';

    const recipesListItems = userRecipes.map((recipe) => {
        const li = document.createElement('li');
        li.className = 'recipe-card';

        li.innerHTML = `
            <div class="recipe-card-media">
                <img
                    class="recipe-img"
                    src="${recipe.image}"
                    alt="${recipe.title}"
                    loading="lazy"
                    onerror="this.classList.add('recipe-img--broken')" />
                <span class="recipe-ready-badge">
                    <span class="material-symbols-rounded">schedule</span>
                    ${recipe.readyInMinutes} min
                </span>
            </div>
            <div class="recipe-card-body">
                <p class="recipe-item-heading" data-recipe-id="${recipe.id}">${recipe.title}</p>
                <div class="recipe-meta">
                    <span class="recipe-meta-item">
                        <span class="material-symbols-rounded">group</span>
                        ${recipe.servings} ${recipe.servings === 1 ? 'serving' : 'servings'}
                    </span>
                </div>
                <a class="recipe-source-link" href="/recipe/view?id=${recipe.id}" target="_blank">
                    <span class="material-symbols-rounded">open_in_new</span>
                    View full recipe
                </a>
            </div>
        `;
        return li;
    });

    track.append(...recipesListItems);
    carousel.append(prevBtn, track, nextBtn);
    document.getElementById('recipes-data-container')?.appendChild(carousel);

    // ---- arrow wiring ----
    function updateArrows() {
        // how far we can still scroll left / right (px)
        const maxScroll = track.scrollWidth - track.clientWidth;
        // 1px fudge so rounding doesn't leave an arrow stuck visible at the end
        prevBtn.classList.toggle('is-hidden', track.scrollLeft <= 1);
        nextBtn.classList.toggle('is-hidden', track.scrollLeft >= maxScroll - 1);
    }

    function scrollByPage(dir: 1 | -1) {
        // scroll ~85% of the visible width so a little of the next card peeks in
        track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', () => scrollByPage(-1));
    nextBtn.addEventListener('click', () => scrollByPage(1));
    track.addEventListener('scroll', updateArrows, { passive: true });
    // recompute on resize since clientWidth changes
    window.addEventListener('resize', updateArrows);

    // initial state — after layout settles so scrollWidth is correct
    requestAnimationFrame(updateArrows);
}

function buildCalorieField(config: CalorieFieldConfig) {
    const button = document.getElementById(config.buttonId) as HTMLButtonElement | null;
    if (!button) return;

    const field = document.createElement('div');
    field.className = 'calorie-field';
    button.parentElement!.insertBefore(field, button);
    field.appendChild(button);

    const editor = document.createElement('div');
    editor.className = 'calorie-editor';
    editor.innerHTML = `
        <span class="material-symbols-rounded calorie-editor-icon">${config.icon}</span>
        <input
            type="number"
            id="${config.buttonId}-input"
            class="calorie-editor-input"
            inputmode="numeric"
            min="0"
            placeholder="${config.placeholder}"
        />
    `;
    field.appendChild(editor);

    const input = editor.querySelector('.calorie-editor-input') as HTMLInputElement;

    function open() {
        field.classList.add('is-editing');
        input.value = '';
        // focus after the transition kicks in so the caret lands cleanly
        requestAnimationFrame(() => input.focus());
    }

    function close() {
        field.classList.remove('is-editing');
    }

    button.addEventListener('click', open);

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
            button.focus();
            return;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (input.value.trim() === '') return;
            input.disabled = true;

            if (config.buttonId === 'add-calories-btn') {
                const newCalories = currentCalories.consumed + parseInt(input.value);
                await changeTodaysCalories(newCalories);
            } else if (config.buttonId === 'set-calorie-goal-btn') {
                await changeCalorieGoal(parseInt(input.value));
            }

            const userCalories = await fetchTodaysCalories();
            input.disabled = false;
            renderTodaysCalories(userCalories);
        }

        const allowed = [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            'Enter',
        ];
        if (allowed.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!Number(e.key) && e.key !== '0') e.preventDefault();
    });

    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
    });

    input.addEventListener('blur', () => {
        close();
    });
}

buildCalorieField({
    buttonId: 'set-calorie-goal-btn',
    placeholder: 'Daily goal (kcal)',
    icon: 'flag',
});

buildCalorieField({
    buttonId: 'add-calories-btn',
    placeholder: 'Calories to add',
    icon: 'add_circle',
});

async function fetchUserLocation() {
    try {
        const res = await fetch('/users/location', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        const responseJSON = await res.json();
        if (responseJSON.lat === null) return null;

        return responseJSON;
    } catch (err) {
        return null;
    }
}

autocompleteList?.addEventListener('click', async (e) => {
    manualLocationInput.textContent = '';
    const value = (e.target as HTMLElement).textContent.trim();
    manualLocationInput.value = value;

    locateBtn.disabled = true;
    weatherError!.hidden = true;

    const userLocation = await geocodeUser(value);
    const userForecast = await fetchWeather(userLocation.lat, userLocation.lon);
    return renderWeather(userForecast);
});

async function geocodeUser(q: string) {
    try {
        const res = await fetch(`/location/geocode?q=${q}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken} `,
            },
            credentials: 'include',
        });
        const userLocation = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw userLocation;

        return userLocation;
    } catch (err: any) {
        return showErrMsg('main-error', err.message);
    }
}

async function reverseGeocodeUser(lat: Latitude, lon: Longitude) {
    try {
        const res = await fetch(`/location/reverse-geocode?lat=${lat}&lon=${lon}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const responseJSON = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw responseJSON;

        return responseJSON;
    } catch (err: any) {
        return showErrMsg('main-error', err.message);
    }
}

async function tokenRefresh() {
    try {
        const res = await fetch('/auth/refresh', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const responseJSON = (await res.json()) as AccessTokenResponse;
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw responseJSON;

        accessToken = responseJSON.accessToken;
    } catch (err: any) {
        return showErrMsg('main-error', err.message);
    }
}

async function bootstrapWeatherData(lat: Latitude, lon: Longitude) {
    const userForecast = await fetchWeather(lat, lon);
    return renderWeather(userForecast);
}

async function bootstrapCaloriesData() {
    const todaysCalories = (await fetchTodaysCalories()) as
        | CalorieHistory
        | BadRequestExceptionResponse;
    if ('statusCode' in todaysCalories) {
        document.getElementById('add-calories-btn')!.hidden = true;
    } else if ('calorieHistory' in todaysCalories)
        renderTodaysCalories(todaysCalories as CalorieHistory);
}

async function bootstrapRecipesData() {
    const userRecipes = (await fetchSavedRecipes()) as UserRecipes;
    if (userRecipes?.length === 0) return;
    renderSavedRecipes(userRecipes);
}

async function bootstrapUserData() {
    if (!accessToken) return;

    const userLocation = await fetchUserLocation();

    if (userLocation !== null) {
        await bootstrapWeatherData(userLocation.lat, userLocation.lon);
    }
    await bootstrapCaloriesData();
    await bootstrapRecipesData();
}

locateBtn?.addEventListener('click', async () => {
    locateBtn.disabled = true;
    locateBtn.classList.add('is-loading');
    weatherError!.textContent = '';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;

            await reverseGeocodeUser(latitude, longitude);
            const userForecast = await fetchWeather(latitude, longitude);
            renderWeather(userForecast);

            locateBtn.disabled = false;
            locateBtn.classList.remove('is-loading');
            locateBtn.hidden = true;
        },
        (err) => {
            locateBtn.disabled = false;
            locateBtn.classList.remove('is-loading');
            showErrMsg('weather-error', err.message);
        },
        { enableHighAccuracy: false, maximumAge: 0, timeout: 7000 }
    );
});

tokenRefresh().then(async () => await bootstrapUserData());
