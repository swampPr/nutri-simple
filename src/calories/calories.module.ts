import { Module } from '@nestjs/common';
import { CaloriesController } from './calories.controller';
import { CaloriesService } from './calories.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserCalories } from './entities/user-calories.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [CaloriesController],
    providers: [CaloriesService],
    imports: [AuthModule, TypeOrmModule.forFeature([UserCalories]), UsersModule],
})
export class CaloriesModule {}
