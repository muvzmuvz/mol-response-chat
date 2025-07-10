import { IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3, { message: 'Имя пользователя должно быть не меньше 3 символов' })
    username: string;

    @IsString()
    @MinLength(6, { message: 'Пароль должен быть не меньше 6 символов' })
    password: string;

    @IsOptional()
    @IsString()
    role?: string; // необязательное поле
}
