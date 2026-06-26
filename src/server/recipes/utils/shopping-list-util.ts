import { ShoppingListDTO } from '../dto/shopping-list.dto';
import { ShoppingListItem, ShoppingListSection } from '../types/list-item.type';
import { BasicIngredient } from '../types/recipe.type';

export function formatShoppingList(
    ingredientsList: BasicIngredient[],
    shoppingListObj: ShoppingListDTO
) {
    for (const ingredient of ingredientsList) {
        let section = shoppingListObj.list.find((listItem) => {
            return listItem.aisle === ingredient.aisle;
        });

        if (!section) {
            section = {} as ShoppingListSection;
            section.aisle = ingredient.aisle;
            section.items = [] as ShoppingListItem[];

            shoppingListObj.list.push(section);
        }

        section.items.push({
            name: ingredient.name,
            amount: `${ingredient.measures.metric.amount} ${ingredient.measures.metric.unitLong}`,
        });
    }

    return shoppingListObj;
}
