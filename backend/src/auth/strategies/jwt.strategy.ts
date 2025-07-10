import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Токен из заголовка Authorization
            secretOrKey: 'supersecret', // В проде лучше брать из .env
        });
    }

    async validate(payload: any) {
        // payload - это данные, которые мы зашифровали в токене (например, user id, username)
        // Возвращаем объект пользователя, который попадет в req.user
        return { userId: payload.sub, username: payload.username, role: payload.role };
    }
}
