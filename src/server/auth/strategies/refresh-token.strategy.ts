import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.refreshToken,
            ]),
            secretOrKey: configService.get('JWT_REFRESH_SECRET') as string,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: JwtPayload) {
        return {
            userId: payload.sub,
            refreshToken: req.cookies.refreshToken,
        };
    }
}
