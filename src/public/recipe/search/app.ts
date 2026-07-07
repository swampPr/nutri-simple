import { RecipeResults } from '../../common/types/recipeResults.js';
import { showErrMsg } from '../../common/utils/set-error.js';

let accessToken: string | null = null;
const logoutLink = document.getElementById('logout-link') as HTMLAnchorElement;
const grid = document.getElementById('results-grid');
const recipeSearchInput = document.getElementById('recipe-search-input') as HTMLInputElement;
const searchInput = document.getElementById('recipe-search-input') as HTMLInputElement;
const clearBtn = document.getElementById('recipe-search-clear') as HTMLButtonElement;

async function saveRecipe(id: number) {
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
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw saveResult;
        return res.ok;
    } catch (err: any) {
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
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw responseJson;

        accessToken = responseJson.accessToken;
    } catch (err: any) {
        showErrMsg('main-error', err.message);
    }
}

async function fetchRecipeSearch(q: string) {
    try {
        const res = await fetch(`/recipes/search?q=${q}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const recipesResults = await res.json();
        if (res.status === 401) return (window.location.href = '/login');
        if (!res.ok) throw recipesResults;

        return recipesResults;
    } catch (err: any) {
        showErrMsg('main-error', err.message);
    }
}

grid?.addEventListener('click', async (e) => {
    const saveBtn = (e.target as HTMLElement).closest(
        '.recipe-card__btn--save'
    ) as HTMLButtonElement;
    if (!saveBtn) return;

    const recipeId: string | undefined = saveBtn.dataset.recipeId;
    if (!recipeId) return;
    await saveRecipe(parseInt(recipeId));
    const defaultIcon = saveBtn.querySelector('.recipe-card__save-icon--default') as HTMLElement;
    const savedIcon = saveBtn.querySelector('.recipe-card__save-icon--saved') as HTMLElement;
    if (defaultIcon) defaultIcon.hidden = true;
    if (savedIcon) savedIcon.hidden = false;
});

function renderRecipeSearch(recipesResults: RecipeResults) {
    if (!grid) return;

    grid.replaceChildren();

    if (recipesResults.recipes.length === 0) return showState('results-none');

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
    if (e.key !== 'Enter') return;

    const query = recipeSearchInput.value.trim();
    if (query.length === 0) return;

    showState('results-loading');
    const recipesResults = await fetchRecipeSearch(query);
    renderRecipeSearch(recipesResults);
});

type ResultState = 'results-empty' | 'results-loading' | 'results-none' | 'results-grid';

// ---------- State switcher ----------
function showState(id: ResultState): void {
    const states: ResultState[] = [
        'results-empty',
        'results-loading',
        'results-none',
        'results-grid',
    ];
    for (const s of states) {
        const el = document.getElementById(s);
        if (el) el.hidden = s !== id;
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
