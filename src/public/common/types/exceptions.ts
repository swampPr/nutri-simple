export type UnauthorizedExceptionResponse = {
    statusCode: 401;
    message: string;
};

export type ConflictExceptionResponse = {
    statusCode: 409;
    message: string;
};
