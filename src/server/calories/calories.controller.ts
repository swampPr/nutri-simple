import { Body, Controller, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CaloriesService } from './calories.service';
import { CaloriesDTO } from './dto/calories.dto';
import type { Request } from 'express';
import { UserID } from 'src/common/types/userid.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

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
    async getUserCalories(@Req() req: Request, @Query('days', ParseIntPipe) numOfDays: number) {
        const { userId } = req.user! as { userId: UserID };
        return this.caloriesService.getUserCalories(userId, numOfDays);
    }
}
