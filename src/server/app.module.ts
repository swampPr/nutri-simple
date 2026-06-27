import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ReqLogger } from './common/middleware/logger.middleware';
import { LocationModule } from './location/location.module';
import { CaloriesModule } from './calories/calories.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controllers';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'src', 'public'),
            exclude: ['/'],
        }),
        UsersModule,
        RecipesModule,
        WeatherModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: process.env.POSTGRES_PASS!,
            database: 'nutrisimple',
            autoLoadEntities: true,
            synchronize: true,
        }),
        AuthModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
        }),
        LocationModule,
        CaloriesModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ReqLogger).forRoutes('*');
    }
}
