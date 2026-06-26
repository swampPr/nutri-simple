import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokens } from './entities/refresh-token.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        RefreshTokenGuard,
        AccessTokenGuard,
    ],
    imports: [UsersModule, PassportModule, TypeOrmModule.forFeature([RefreshTokens])],
    exports: [RefreshTokenGuard, AccessTokenGuard],
})
export class AuthModule {}
