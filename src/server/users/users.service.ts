import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { CalorieGoalDTO } from './dto/calorie-goal.dto';
import { UserID } from '../common/types/userid.types';
import type { Latitude, Longitude } from '../common/types/geo.types';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async findByUsername(userName: string) {
        return await this.usersRepository.findOne({
            where: {
                userName,
            },
        });
    }

    async findByID(id: UserID) {
        return await this.usersRepository.findOne({
            where: {
                id,
            },
        });
    }

    async createUser(userName: string, passwordHash: string) {
        const newUser = this.usersRepository.create({
            userName,
            passwordHash,
        });

        return await this.usersRepository.save(newUser);
    }

    async updateUserLocation(lat: Latitude, lon: Longitude, locationName: string, id: UserID) {
        return await this.usersRepository.update(id, {
            lat,
            lon,
            locationName,
        });
    }

    async getUserLocation(id: UserID) {
        const user = await this.findByID(id);
        if (!user) return null;

        const { lat, lon, locationName } = user!;

        return {
            lat,
            lon,
            locationName,
        };
    }

    async setUserCalorieGoal(calorieGoalDTO: CalorieGoalDTO, id: UserID) {
        const { goal } = calorieGoalDTO;
        const { affected } = await this.usersRepository.update(id, {
            calorieGoal: goal,
        });

        return {
            affected,
        };
    }
    async getUserCalorieGoal(id: UserID) {
        const user = await this.usersRepository.findOne({
            where: {
                id,
            },
        });

        return user?.calorieGoal;
    }
}
