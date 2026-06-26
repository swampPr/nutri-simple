import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [WeatherController],
    providers: [WeatherService],
    imports: [UsersModule, AuthModule],
})
export class WeatherModule {}
