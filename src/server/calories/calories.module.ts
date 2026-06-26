import { Module } from '@nestjs/common';
import { CaloriesController } from './calories.controller';
import { CaloriesService } from './calories.service';
import { UserCalories } from './entities/user-calories.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    controllers: [CaloriesController],
    providers: [CaloriesService],
    imports: [AuthModule, TypeOrmModule.forFeature([UserCalories]), UsersModule],
})
export class CaloriesModule {}
