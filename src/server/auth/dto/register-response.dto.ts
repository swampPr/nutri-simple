import { User } from 'src/server/users/entities/users.entity';

export class RegisterResponseDTO {
    constructor(user: User) {
        this.id = user.id;
        this.userName = user.userName;
    }

    id: number;
    userName: string;
}
