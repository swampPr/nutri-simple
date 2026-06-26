import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRecipes } from './entities/user-recipes.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [RecipesController],
    providers: [RecipesService],
    imports: [AuthModule, TypeOrmModule.forFeature([UserRecipes])],
})
export class RecipesModule {}
