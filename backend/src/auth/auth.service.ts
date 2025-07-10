// auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userRepo.findOne({ where: { username: dto.username } });
        if (existing) {
            throw new BadRequestException('Username already taken');
        }

        const hash = await bcrypt.hash(dto.password, 10);

        const user = this.userRepo.create({ username: dto.username, password: hash, role: dto.role ?? 'user' });
        await this.userRepo.save(user);

        return { message: 'User registered successfully' };
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { username: dto.username } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.getTokens(user.id, user.username, user.role);

        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return tokens;
    }

    async getTokens(userId: number, username: string, role: string) {
        const payload = { sub: userId, username, role };

        const access_token = await this.jwtService.signAsync(payload, {
            secret: 'supersecret',
            expiresIn: '15m',
        });
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: 'supersecret',
            expiresIn: '7d',
        });

        return { access_token, refresh_token };
    }

    async updateRefreshToken(userId: number, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.userRepo.update(userId, { currentHashedRefreshToken: hash });
    }

    async logout(userId: number) {
        await this.userRepo.update(userId, { currentHashedRefreshToken: undefined });
    }

    async refreshTokens(userId: number, refreshToken: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.currentHashedRefreshToken) {
            throw new UnauthorizedException('Access denied');
        }

        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
        if (!isRefreshTokenMatching) {
            throw new UnauthorizedException('Access denied');
        }

        const tokens = await this.getTokens(user.id, user.username, user.role);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return tokens;
    }
    async getUserFromToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            return this.userRepo.findOneBy({ id: payload.sub });
        } catch (e) {
            return null;
        }
    }
}

