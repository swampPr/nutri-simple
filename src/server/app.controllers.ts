import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('/')
export class AppController {
    constructor(private jwtService: JwtService) {}

    @Get('/')
    async index(@Res() res: Response, @Req() req: Request) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) return res.status(401).redirect('/login');

            //NOTE: If it fails, it throws an error, if it passes, it redirects to dashboard
            await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET!,
            });

            return res.redirect('/dashboard');
        } catch (err) {
            return res.status(401).redirect('/login');
        }
    }
}
