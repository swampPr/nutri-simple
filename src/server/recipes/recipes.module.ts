import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRecipes } from './entities/user-recipes.entity';

@Module({
    controllers: [RecipesController],
    providers: [RecipesService],
    imports: [AuthModule, TypeOrmModule.forFeature([UserRecipes])],
})
export class RecipesModule {}
