import { UserID } from 'src/server/common/types/userid.types';

export type JwtPayload = {
    sub: UserID;
};
