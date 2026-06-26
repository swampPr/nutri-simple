import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [LocationController],
    providers: [LocationService],
    imports: [UsersModule],
})
export class LocationModule {}
