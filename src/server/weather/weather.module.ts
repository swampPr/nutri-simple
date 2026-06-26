import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [WeatherController],
    providers: [WeatherService],
    imports: [UsersModule, AuthModule],
})
export class WeatherModule {}
