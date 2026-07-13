import { AccessTokenResponse } from '../../common/types/accessToken';
import { SavedRecipe } from '../../common/types/recipeInstructions';
import { showErrMsg } from '../../common/utils/set-error.js';

let accessToken: string | null = null;
const form = document.getElementById('ingredient-form') as HTMLFormElement;
const clearAllBtn = document.getElementById('clear-all') as HTMLButtonElement;
const filterInput = document.getElementById('ingredient-filter') as HTMLInputElement;
const clearFilterBtn = document.getElementById('clear-filter') as HTMLButtonElement;
const emptyState = document.getElementById('empty-state') as HTMLParagraphElement;
const emptyQuery = document.getElementById('empty-query') as HTMLSpanElement;
const categories = form.querySelectorAll<HTMLDetailsElement>('.category');
const resultsContainer = document.getElementById('recipe-results');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('selection-count')!.textContent = '';
    const selected = new FormData(form).getAll('ingredients');
    document.getElementById('selection-count')!.textContent = selected.length.toString();
});

form.addEventListener('change', (e) => {
    e.preventDefault();
    document.getElementById('selection-count')!.textContent = '';
    const selected = new FormData(form).getAll('ingredients');
    document.getElementById('selection-count')!.textContent = selected.length.toString();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selected = new FormData(form).getAll('ingredients');
    const payload: string[] = [];
    selected.forEach((i) => payload.push(i.toString()));
    const userRecipes = (await fetchRecipes(payload)) as Pick<
        SavedRecipe,
        'title' | 'image' | 'id'
    >[];
    renderRecipes(userRecipes);
});

resultsContainer?.addEventListener('click', async (e) => {
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

async function saveRecipe(recipeId: number) {
    try {
        const res = await fetch(`/recipes/save/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            method: 'POST',
            credentials: 'include',
        });
        const responseJson = await res.json();
        if (res.status === 401) window.location.href = '/login';
        if (!res.ok) throw responseJson;

        return responseJson.identifiers.length > 0;
    } catch (err: any) {
        showErrMsg('main-error', err.message);
    }
}

async function fetchRecipes(payload: string[]) {
    try {
        const res = await fetch('/recipes/get-by-ingredients', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                ingredients: payload,
            }),
            credentials: 'include',
        });
        const userRecipes: Pick<SavedRecipe, 'id' | 'title' | 'image'>[] = await res.json();
        if (res.status === 401) window.location.href = '/login';
        if (!res.ok) throw userRecipes;

        return userRecipes;
    } catch (err: any) {
        showErrMsg('main-error', err.message);
    }
}

function renderRecipes(userRecipes: Pick<SavedRecipe, 'id' | 'title' | 'image'>[]) {
    if (userRecipes.length === 0) {
        document.getElementById('jump-to-results')!.hidden = true;
        document.getElementById('empty-state')!.hidden = false;
        return;
    }

    resultsContainer!.replaceChildren();
    const resultsList = document.createElement('ul');
    resultsList.classList.add('results-list');

    const resultsListItems = userRecipes.map((recipe) => {
        const card = document.createElement('li');
        card.classList.add('recipe-card');
        card.dataset.recipeId = `${recipe.id}`;

        card.innerHTML = `
            <div class="recipe-card__media">
                <img class="recipe-card__img" src="${recipe.image}" alt="${recipe.title}" loading="lazy" />
            </div>
            <div class="recipe-card__body">
                <h3 class="recipe-card__title">${recipe.title}</h3>
                <div class="recipe-card__actions">
                    <a class="recipe-card__btn recipe-card__btn--view" href="/recipe/view?id=${recipe.id}" target="__blank" >
                        <span class="material-symbols-rounded">receipt_long</span>
                        View recipe
                    </a>
                    <button class="recipe-card__btn recipe-card__btn--save" data-recipe-id="${recipe.id}" type="button" data-action="save" aria-label="Save recipe" title="Save recipe">
                        <span class="material-symbols-rounded recipe-card__save-icon recipe-card__save-icon--default">bookmark_add</span>
                        <span class="material-symbols-rounded recipe-card__save-icon recipe-card__save-icon--saved" hidden>bookmark_added</span>
                    </button>
                </div>
            </div>
        `;

        return card;
    });

    document.getElementById('jump-to-results')!.hidden = false;
    resultsList.append(...resultsListItems);
    resultsContainer?.appendChild(resultsList);
}

function applyIngredientFilter(rawQuery: string): void {
    const query = rawQuery.trim().toLowerCase();
    let anyVisible = false;

    categories.forEach((category) => {
        let visibleInCategory = 0;

        category.querySelectorAll<HTMLDivElement>('.ingredient').forEach((item) => {
            const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
            const matches =
                query === '' || (checkbox?.value.toLowerCase().includes(query) ?? false);

            item.classList.toggle('is-hidden', !matches);
            if (matches) visibleInCategory += 1;
        });

        category.hidden = query !== '' && visibleInCategory === 0;
        if (visibleInCategory > 0) anyVisible = true;
    });

    emptyState.hidden = anyVisible || query === '';
    emptyQuery.textContent = rawQuery.trim();
}

filterInput.addEventListener('input', () => {
    clearFilterBtn.hidden = filterInput.value.trim().length === 0;
    applyIngredientFilter(filterInput.value);
});

clearFilterBtn.addEventListener('click', () => {
    filterInput.value = '';
    clearFilterBtn.hidden = true;
    applyIngredientFilter('');
    filterInput.focus();
});

clearAllBtn.addEventListener('click', () => {
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').forEach(
        (checkbox) => {
            checkbox.checked = false;
        }
    );
    document.getElementById('selection-count')!.textContent = '0';
});

async function tokenRefresh() {
    try {
        const res = await fetch('/auth/refresh', {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        });
        const accessTokenRes = (await res.json()) as AccessTokenResponse;
        if (res.status === 401) window.location.href = '/login';
        if (!res.ok) throw accessTokenRes;

        accessToken = accessTokenRes.accessToken;
    } catch (err: any) {
        showErrMsg('main-error', err.message);
    }
}

tokenRefresh();
