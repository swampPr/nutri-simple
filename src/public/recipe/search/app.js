import { showErrMsg } from '../../common/utils/set-error.js';
let accessToken = null;
const logoutLink = document.getElementById('logout-link');
const grid = document.getElementById('results-grid');
const recipeSearchInput = document.getElementById('recipe-search-input');
const searchInput = document.getElementById('recipe-search-input');
const clearBtn = document.getElementById('recipe-search-clear');
async function saveRecipe(id) {
    try {
        const res = await fetch(`/recipes/save/${id}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            method: 'POST',
        });
        const saveResult = await res.json();
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw saveResult;
        return res.ok;
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
        const responseJson = await res.json();
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw responseJson;
        accessToken = responseJson.accessToken;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
async function fetchRecipeSearch(q) {
    try {
        const res = await fetch(`/recipes/search?q=${q}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const recipesResults = await res.json();
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw recipesResults;
        return recipesResults;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
grid?.addEventListener('click', async (e) => {
    const saveBtn = e.target.closest('.recipe-card__btn--save');
    if (!saveBtn)
        return;
    const recipeId = saveBtn.dataset.recipeId;
    if (!recipeId)
        return;
    await saveRecipe(parseInt(recipeId));
    const defaultIcon = saveBtn.querySelector('.recipe-card__save-icon--default');
    const savedIcon = saveBtn.querySelector('.recipe-card__save-icon--saved');
    if (defaultIcon)
        defaultIcon.hidden = true;
    if (savedIcon)
        savedIcon.hidden = false;
});
grid?.addEventListener('click', async (e) => {
    const viewBtn = e.target.closest('.recipe-card__btn--view');
    if (!viewBtn)
        return;
    const recipeId = viewBtn.dataset.recipeId;
    if (!recipeId)
        return;
    window.open(`/recipe/view?id=${recipeId}`, '__blank');
});
function renderRecipeSearch(recipesResults) {
    if (!grid)
        return;
    grid.replaceChildren();
    if (recipesResults.recipes.length === 0)
        return showState('results-none');
    const cards = recipesResults.recipes.map((recipe) => {
        const card = document.createElement('article');
        card.classList.add('recipe-card');
        card.innerHTML = `
            <div class="recipe-card__media">
                <img
                    class="recipe-card__img"
                    src="${recipe.image}"
                    alt="${recipe.title}"
                    loading="lazy"
                    onerror="this.style.visibility='hidden'" />
            </div>
            <div class="recipe-card__body">
                <h3 class="recipe-card__title" data-recipe-id="${recipe.id}">${recipe.title}</h3>
                <div class="recipe-card__actions">
                    <button
                        class="recipe-card__btn recipe-card__btn--view"
                        type="button"
                        data-recipe-id="${recipe.id}">
                        <span class="material-symbols-rounded">receipt_long</span>
                        View recipe
                    </button>
                    <button
                        class="recipe-card__btn recipe-card__btn--save"
                        type="button"
                        data-recipe-id="${recipe.id}"
                        aria-label="Save recipe"
                        title="Save recipe">
                        <span class="material-symbols-rounded recipe-card__save-icon recipe-card__save-icon--default">bookmark_add</span>
                        <span class="material-symbols-rounded recipe-card__save-icon recipe-card__save-icon--saved" hidden>bookmark_added</span>
                    </button>
                </div>
            </div>
        `;
        return card;
    });
    grid.append(...cards);
    showState('results-grid');
}
logoutLink?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/auth/logout', {
        headers: {
            Accept: 'application/json',
        },
        credentials: 'include',
    });
    return (window.location.href = '/login');
});
recipeSearchInput.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter')
        return;
    const query = recipeSearchInput.value.trim();
    if (query.length === 0)
        return;
    showState('results-loading');
    const recipesResults = await fetchRecipeSearch(query);
    renderRecipeSearch(recipesResults);
});
// ---------- State switcher ----------
function showState(id) {
    const states = [
        'results-empty',
        'results-loading',
        'results-none',
        'results-grid',
    ];
    for (const s of states) {
        const el = document.getElementById(s);
        if (el)
            el.hidden = s !== id;
    }
}
// ---------- Clear button visibility ----------
// Show the clear button whenever the field has content.
searchInput.addEventListener('input', () => {
    clearBtn.hidden = searchInput.value.length === 0;
});
// ---------- Clear button action ----------
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.hidden = true;
    searchInput.focus();
    showState('results-empty'); // back to the initial prompt
});
tokenRefresh();
