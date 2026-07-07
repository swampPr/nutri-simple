import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CaloriesService } from './calories.service';
import { CaloriesDTO } from './dto/calories.dto';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserID } from '../common/types/userid.types';

@Controller('calories')
export class CaloriesController {
    constructor(private caloriesService: CaloriesService) {}

    @Post('/set')
    @UseGuards(AccessTokenGuard)
    async setUserCalories(@Req() req: Request, @Body() calories: CaloriesDTO) {
        const { userId } = req.user! as { userId: UserID };
        return await this.caloriesService.setUserCalories(userId, calories);
    }

    @Get('/get')
    @UseGuards(AccessTokenGuard)
    async getUserCalories(@Req() req: Request, @Query('days') numOfDays: number) {
        const { userId } = req.user! as { userId: UserID };
        return this.caloriesService.getUserCalories(userId, numOfDays);
    }
}
