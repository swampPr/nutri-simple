import { showErrMsg } from '../../common/utils/set-error.js';
//TODO: I think it's done but just make sure.
const recipeTitle = document.querySelector('[data-recipe-title]');
let accessToken = null;
const searchParams = new URLSearchParams(window.location.search);
const backLink = document.getElementById('back_link');
const recipeImage = document.querySelector('[data-recipe-image]');
const sourceLink = document.querySelector('[data-recipe-source]');
const recipeId = parseInt(searchParams.get('id'));
const previousUrl = new URL(document.referrer).pathname;
async function fetchRecipeInstructions(recipeId) {
    try {
        const res = await fetch(`/recipes/instructions/${recipeId}`, {
            headers: {
                Accept: `application/json`,
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });
        const recipeInstructions = await res.json();
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw recipeInstructions;
        return recipeInstructions;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
function renderRecipeInstructions(recipeInstructions) {
    const ingredientsList = document.querySelector('[data-ingredient-list]');
    const instructionsList = document.querySelector('[data-instruction-list]');
    const macroList = document.querySelector('[data-macro-list]');
    const equipmentList = document.querySelector('[data-equipment-list]');
    const nutrientList = document.querySelector('[data-nutrient-list]');
    recipeImage.src = recipeInstructions.recipeInfo.image;
    recipeTitle.textContent = recipeInstructions.recipeInfo.title;
    backLink.href = `${previousUrl}`;
    sourceLink.href = recipeInstructions.recipeInfo.sourceUrl;
    ingredientsList.replaceChildren();
    equipmentList?.replaceChildren();
    instructionsList?.replaceChildren();
    macroList?.replaceChildren();
    const ingredientItems = recipeInstructions.recipeInfo.extendedIngredients.map((ingredient) => {
        const li = document.createElement('li');
        li.classList.add('ingredient-list__item');
        li.innerHTML = `
        <span class="material-symbols-rounded ingredient-list__bullet"
            >radio_button_unchecked</span
        >
        <span class="ingredient-list__text">${ingredient.original}</span>
        `;
        return li;
    });
    const instructionsItems = [];
    for (let i = 0; i < recipeInstructions.stepsAndEquipment.stepData.length; i++) {
        const steps = recipeInstructions.stepsAndEquipment.stepData[i].steps;
        for (let j = 0; j < steps.length; j++) {
            const li = document.createElement('li');
            li.classList.add('instruction-list__step');
            li.innerHTML = `
            <span class="material-symbols-rounded instruction-list__number">adjust</span>
            <p class="instruction-list__text">${steps[j].step}</p>
        `;
            instructionsItems.push(li);
        }
    }
    const macros = ['Carbohydrates', 'Protein', 'Fat', 'Water'];
    const macroItems = recipeInstructions.recipeInfo.nutrition.nutrients.filter((nutrient) => macros.includes(nutrient.name));
    const nutrientItems = recipeInstructions.recipeInfo.nutrition.nutrients.filter((nutrient) => !macros.includes(nutrient.name));
    const macroColorMap = {
        Carbohydrates: 'macro-row__fill--carbs',
        Protein: 'macro-row__fill--protein',
        Fat: 'macro-row__fill--fat',
    };
    // rough daily-value references so bars are visually meaningful
    const macroDailyValue = {
        Carbohydrates: 275,
        Protein: 50,
        Fat: 78,
    };
    const macroListItems = macroItems
        .filter((nutrient) => nutrient.name !== 'Water')
        .map((nutrient) => {
        const li = document.createElement('li');
        li.classList.add('macro-row');
        const dv = macroDailyValue[nutrient.name] ?? nutrient.amount;
        const pct = Math.max(4, Math.min((nutrient.amount / dv) * 100, 100));
        const fillClass = macroColorMap[nutrient.name] ?? 'macro-row__fill--protein';
        li.innerHTML = `
            <div class="macro-row__top">
                <span class="macro-row__label">${nutrient.name}</span>
                <span class="macro-row__value">${Math.round(nutrient.amount)}${nutrient.unit}</span>
            </div>
            <div class="macro-row__track">
                <div class="macro-row__fill ${fillClass}" style="width: ${pct}%"></div>
            </div>
        `;
        return li;
    });
    const nutrientListItems = nutrientItems.map((nutrient) => {
        const li = document.createElement('li');
        li.classList.add('nutrition-details__row');
        li.innerHTML = `
            <span>${nutrient.name}</span>
            <span>${Math.round(nutrient.amount)}${nutrient.unit}</span>
        `;
        return li;
    });
    const equipmentArr = recipeInstructions.stepsAndEquipment.equipment;
    const uniqueEquipments = equipmentArr.filter((equipment, idx) => equipmentArr.findIndex((e) => e.name === equipment.name) === idx);
    const equipmentListItems = uniqueEquipments.map((equipment) => {
        const li = document.createElement('li');
        li.classList.add('equipment-list__item');
        li.innerHTML = `
        <li class="equipment-list__item">
            <span class="material-symbols-rounded">check_circle</span>
            ${equipment.name}
        </li>
        `;
        return li;
    });
    document.querySelector('[data-ready-time]').textContent =
        `${recipeInstructions.recipeInfo.readyInMinutes} mins`;
    document.querySelector('[data-servings]').textContent =
        `${recipeInstructions.recipeInfo.servings}`;
    document.querySelector('[data-calories]').textContent =
        `${Math.round(recipeInstructions.recipeInfo.nutrition.nutrients[0].amount)}`;
    ingredientsList.append(...ingredientItems);
    instructionsList.append(...instructionsItems);
    macroList?.append(...macroListItems);
    nutrientList?.append(...nutrientListItems);
    equipmentList?.append(...equipmentListItems);
}
async function getRecipeInstructions(recipeId) {
    const recipeInstructions = await fetchRecipeInstructions(recipeId);
    renderRecipeInstructions(recipeInstructions);
}
async function tokenRefresh() {
    try {
        const res = await fetch('/auth/refresh', {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        });
        const tokenResponse = (await res.json());
        if (res.status === 401)
            return (window.location.href = '/login');
        if (!res.ok)
            throw tokenResponse;
        accessToken = tokenResponse.accessToken;
    }
    catch (err) {
        showErrMsg('main-error', err.message);
    }
}
tokenRefresh().then(() => getRecipeInstructions(recipeId));
