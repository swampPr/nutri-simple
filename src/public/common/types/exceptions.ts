export type UnauthorizedExceptionResponse = {
    statusCode: 401;
    message: string;
};

export type ConflictExceptionResponse = {
    statusCode: 409;
    message: string;
};

export type BadRequestExceptionResponse = {
    statusCode: 400;
    message: string;
};

export type NotFoundRequestExceptionResponse = {
    statusCode: 404;
    message: string;
};
