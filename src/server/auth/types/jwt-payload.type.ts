import { UserID } from 'src/common/types/userid.types';

export type JwtPayload = {
    sub: UserID;
};
