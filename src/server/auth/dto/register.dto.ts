import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
export class RegisterDTO {
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/)
    userName: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password: string;
}
