import { IsInt, IsNotEmpty } from 'class-validator';

export class CalorieGoalDTO {
    @IsInt()
    @IsNotEmpty()
    goal: number;
}
