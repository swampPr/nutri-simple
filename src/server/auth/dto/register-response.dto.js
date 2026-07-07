export class RegisterResponseDTO {
    constructor(user) {
        this.id = user.id;
        this.userName = user.userName;
    }
}
