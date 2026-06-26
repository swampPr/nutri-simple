import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import chalk from 'chalk';

export class ReqLogger implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log(
            `${chalk.yellow(new Date().toISOString())} ${chalk.yellow(':')} ${chalk.green(req.method)} ${chalk.blue(req.originalUrl)} ${Object.keys(req.cookies).length > 0 ? chalk.red('Cookies Present') : ''} `
        );

        next();
    }
}
