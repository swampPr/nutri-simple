export type CalorieHistory = {
    calorieHistory: CalorieHistoryItem[];
};

type CalorieHistoryItem = {
    day: string;
    calories: number;
    calorieGoal: number;
};
