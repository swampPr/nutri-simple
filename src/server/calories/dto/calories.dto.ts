import { IsInt, IsNotEmpty } from 'class-validator';

export class CaloriesDTO {
    @IsInt()
    @IsNotEmpty()
    calories: number;
}
