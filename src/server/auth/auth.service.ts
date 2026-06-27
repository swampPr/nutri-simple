import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { RegisterDTO } from './dto/register.dto';
import { RegisterResponseDTO } from './dto/register-response.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.type';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokens } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserID } from '../common/types/userid.types';
import { hashToken256 } from '../common/utils/hash-util';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(RefreshTokens)
        private refreshTokenRepo: Repository<RefreshTokens>,
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async storeRefreshToken(
        id: UserID,
        tokenHash: string,
        expiresAt: Date
    ): Promise<RefreshTokens> {
        const newToken = this.refreshTokenRepo.create({
            user: { id },
            tokenHash: tokenHash,
            expiresAt: expiresAt,
        });

        return await this.refreshTokenRepo.save(newToken);
    }

    async registerUser(registerDTO: RegisterDTO): Promise<RegisterResponseDTO> {
        const exists = await this.usersService.findByUsername(registerDTO.userName);
        if (exists) throw new ConflictException('Username already exists');

        const passwordHash = await hash(registerDTO.password, 10);

        const newUser = await this.usersService.createUser(registerDTO.userName, passwordHash);

        return new RegisterResponseDTO(newUser);
    }

    async loginUser(loginDTO: LoginDTO) {
        const user = await this.usersService.findByUsername(loginDTO.userName);
        const invalidCredErr = new UnauthorizedException('Invalid username or password');

        if (!user) throw invalidCredErr;

        const comparePasswords = await compare(loginDTO.password, user.passwordHash);

        if (!comparePasswords) throw invalidCredErr;

        const tokenPayload: JwtPayload = { sub: user.id };

        const refreshToken = this.jwtService.sign(tokenPayload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        //NOTE: Prepare to store refresh token info into DB.
        const refreshTokenHash = hashToken256(refreshToken);

        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

        await this.storeRefreshToken(user.id, refreshTokenHash, refreshTokenExpiresAt);

        const accessToken = this.jwtService.sign(tokenPayload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m',
        });

        return {
            refreshToken,
            accessToken,
        };
    }

    async logoutUser(refreshToken: string) {
        const tokenHash = hashToken256(refreshToken);

        const deletedToken = await this.refreshTokenRepo.delete({ tokenHash: tokenHash });
        return {
            deleted: deletedToken.affected,
        };
    }

    async tokenRefresh(id: UserID): Promise<{ accessToken: string }> {
        const newPayload: JwtPayload = {
            sub: id,
        };

        const accessToken = this.jwtService.sign(newPayload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m',
        });

        return {
            accessToken,
        };
    }

    async validateRefreshToken(token: string) {
        return await this.jwtService.verifyAsync(token);
    }
}
