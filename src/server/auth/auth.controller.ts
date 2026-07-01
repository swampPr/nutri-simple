import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { RegisterResponseDTO } from './dto/register-response.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import type { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserID } from '../common/types/userid.types';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async createUser(@Body() registerDTO: RegisterDTO): Promise<RegisterResponseDTO> {
        return await this.authService.registerUser(registerDTO);
    }

    @Post('login')
    async loginUser(@Body() loginDTO: LoginDTO, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken } = await this.authService.loginUser(loginDTO);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        return {
            accessToken,
        };
    }

    @Post('logout')
    @UseGuards(RefreshTokenGuard)
    async logoutUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { refreshToken } = req.user! as { refreshToken: string };

        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: true });

        return await this.authService.logoutUser(refreshToken);
    }

    @Get('/refresh')
    @UseGuards(RefreshTokenGuard)
    async tokenRefresh(@Req() req: Request) {
        const { userId } = req.user! as { userId: UserID };
        return this.authService.tokenRefresh(userId);
    }
}
