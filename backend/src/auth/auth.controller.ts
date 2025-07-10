// auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post('register')
    register(@Body() dto: RegisterDto) {
        console.log('Получен DTO:', dto);
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() req) {
        return this.authService.logout(req.user.userId);
    }

    @Post('refresh')
    async refresh(@Body() body: { userId: number; refreshToken: string }) {
        return this.authService.refreshTokens(body.userId, body.refreshToken);
    }
}
