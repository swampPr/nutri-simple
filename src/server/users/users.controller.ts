import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request } from 'express';
import { CalorieGoalDTO } from './dto/calorie-goal.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserID } from '../common/types/userid.types';

@Controller('users')
export class UsersControllers {
    constructor(private usersService: UsersService) {}

    @Get('/location/')
    @UseGuards(AccessTokenGuard)
    async getUserLocation(@Req() req: Request) {
        const { userId } = req.user! as { userId: UserID };
        return this.usersService.getUserLocation(userId);
    }

    @Post('/set-calorie-goal')
    @UseGuards(AccessTokenGuard)
    async setUserCalorieGoal(@Body() calorieGoalDTO: CalorieGoalDTO, @Req() req: Request) {
        const { userId } = req.user! as { userId: UserID };
        return await this.usersService.setUserCalorieGoal(calorieGoalDTO, userId);
    }
}
