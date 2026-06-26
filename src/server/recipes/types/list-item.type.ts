export type ShoppingListSection = {
    aisle: string;
    items: ShoppingListItem[];
};

export type ShoppingListItem = {
    name: string;
    amount: string;
};
