import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCalories } from './entities/user-calories.entity';
import { Between, Repository } from 'typeorm';
import { CaloriesDTO } from './dto/calories.dto';
import { CalorieHistoryDTO } from './dto/calorie-history.dto';
import { UsersService } from '../users/users.service';
import { UserID } from '../common/types/userid.types';

@Injectable()
export class CaloriesService {
    constructor(
        @InjectRepository(UserCalories) private userCaloriesRepository: Repository<UserCalories>,
        private usersService: UsersService
    ) {}

    async setUserCalories(id: UserID, caloriesDTO: CaloriesDTO) {
        const day = new Date().toISOString().split('T')[0];
        const { calories } = caloriesDTO;
        return await this.userCaloriesRepository.upsert(
            {
                user: { id },
                calories,
                day,
            },
            {
                conflictPaths: ['user', 'day'],
            }
        );
    }

    async getUserCalories(id: UserID, numOfDays: number): Promise<CalorieHistoryDTO> {
        const from = new Date();
        const to = new Date().toISOString().split('T')[0];

        from.setDate(from.getDate() - (numOfDays - 1));

        const calorieHistory = await this.userCaloriesRepository.find({
            where: {
                user: { id },
                day: Between(from.toISOString().split('T')[0], to),
            },
        });

        const calorieGoal = await this.usersService.getUserCalorieGoal(id);
        if (!calorieGoal)
            throw new BadRequestException('Must set a calorie goal before viewing calorie progres');

        const calorieHistoryDTO: CalorieHistoryDTO = {
            calorieHistory: calorieHistory.map((item) => {
                return {
                    calorieGoal,
                    calories: item.calories,
                    day: item.day,
                };
            }),
        };

        return calorieHistoryDTO;
    }
}
