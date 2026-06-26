import { ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class CalorieHistoryDTO {
    @IsNotEmpty()
    @ArrayNotEmpty()
    calorieHistory: CalorieHistoryItem[];
}

type CalorieHistoryItem = {
    day: string;
    calories: number;
    calorieGoal: number;
};
