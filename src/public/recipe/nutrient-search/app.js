import { showErrMsg } from '../../common/utils/set-error.js';
let accessToken = null;
const nutrientGrid = document.querySelector('.nutrient-grid');
const resultsGrid = document.getElementById('results-grid');
const searchBtn = document.getElementById('nutrient-search');
const form = document.getElementById('nutrient-filter-form');
nutrientGrid.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement))
        return;
    if (e.target.type !== 'number')
        return;
});
searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {};
    for (const [key, value] of formData) {
        if (value === '')
            continue;
        else if (value === 'on' && key === 'random') {
            payload[key] = true;
            continue;
        }
        payload[key] = Number(value);
    }
    document.getElementById('results-loading').hidden = false;
    const userRecipes = (await fetchRecipes(payload));
    renderRecipes(userRecipes);
});
async function saveRecipe(recipeId) {
    try {
        const res = await fetch(`/recipes/save/${recipeId}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'POST',
            credentials: 'include',
        });
        const responseJson = await res.json();
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw responseJson;
        return responseJson.identifiers.length > 0;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
resultsGrid.addEventListener('click', async (e) => {
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
function renderRecipes(userRecipes) {
    document.getElementById('results-loading').hidden = true;
    document.getElementById('results-empty').hidden = true;
    resultsGrid.replaceChildren();
    if (userRecipes.length === 0) {
        resultsGrid.hidden = true;
        document.getElementById('results-none').hidden = false;
        return;
    }
    document.getElementById('results-none').hidden = true;
    const cards = userRecipes.map((recipe) => {
        const card = document.createElement('div');
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
    resultsGrid.append(...cards);
    resultsGrid.hidden = false;
}
async function fetchRecipes(payload) {
    console.log(payload);
    try {
        const res = await fetch('/recipes/get-by-nutrients', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            method: 'POST',
            credentials: 'include',
        });
        const userRecipes = (await res.json())
            .recipes;
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw userRecipes;
        console.log(userRecipes);
        return userRecipes;
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
tokenRefresh();
