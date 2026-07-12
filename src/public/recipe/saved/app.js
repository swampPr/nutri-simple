import { showErrMsg } from '../../common/utils/set-error.js';
const recipeGrid = document.getElementById('recipe-grid');
let accessToken = null;
async function fetchSavedRecipes() {
    try {
        const res = await fetch('/recipes/saved', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const userRecipes = await res.json();
        if (res.status === 401)
            window.location.href = '/login';
        if (!res.ok)
            throw userRecipes;
        return userRecipes;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
recipeGrid.addEventListener('click', async (e) => {
    if (!(e.target instanceof Element))
        return;
    const card = e.target.closest('.recipe-card');
    if (!card)
        return;
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === 'unsave') {
            const recipeId = parseInt(card.dataset.recipeId);
            await unsaveRecipe(recipeId);
            const userRecipes = (await fetchSavedRecipes());
            return renderSavedRecipes(userRecipes);
        }
    }
});
function renderSavedRecipes(userRecipes) {
    recipeGrid?.replaceChildren();
    if (userRecipes.length === 0)
        return (document.getElementById('empty-state').hidden = false);
    document.getElementById('empty-state').hidden = true;
    const recipeListItems = userRecipes.map((recipe) => {
        const li = document.createElement('li');
        li.classList.add('recipe-card');
        li.dataset.recipeId = `${recipe.id}`;
        li.innerHTML = `
            <div class="recipe-card-media">
                <img class="recipe-card-img" src="${recipe.image}" alt="Recipe Image" loading="lazy" />
            </div>
            <div class="recipe-card-body">
                <h3 class="recipe-card-title" data-field="title">${recipe.title}</h3>
                <div class="recipe-card-meta">
                    <span class="meta-chip">
                        <span class="material-symbols-rounded">schedule</span>
                        <span data-field="readyInMinutes">${recipe.readyInMinutes}</span>&nbsp;min
                    </span>
                    <span class="meta-chip">
                        <span class="material-symbols-rounded">groups</span>
                        <span data-field="servings">${recipe.servings}</span>&nbsp;servings
                    </span>
                </div>
                <div class="recipe-card-actions">
                    <a class="card-btn card-btn--primary" href="/recipe/view?id=${recipe.id}" target="__blank" data-action="view">
                        <span class="material-symbols-rounded">visibility</span>
                        View recipe
                    </a>
                    <button class="card-btn card-btn--outline" type="button" data-action="unsave">
                        <span class="material-symbols-rounded">bookmark_remove</span>
                        Unsave
                    </button>
                </div>
            </div>
        `;
        return li;
    });
    recipeGrid.append(...recipeListItems);
}
async function unsaveRecipe(recipeId) {
    try {
        const res = await fetch(`/recipes/unsave/${recipeId}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'POST',
            credentials: 'include',
        });
        const responseJson = await res.json();
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw responseJson;
        return responseJson.affected > 0;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
async function getSavedRecipes() {
    const userRecipes = (await fetchSavedRecipes());
    renderSavedRecipes(userRecipes);
}
async function tokenRefresh() {
    try {
        const res = await fetch('/auth/refresh', {
            headers: {
                Accept: 'application/ json',
            },
            credentials: 'include',
        });
        const accessTokenRes = (await res.json());
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw accessToken;
        accessToken = accessTokenRes.accessToken;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
tokenRefresh().then(async () => await getSavedRecipes());
