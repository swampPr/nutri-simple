import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import type { SavedRecipe } from '../types/recipe.type';
import { User } from 'src/server/users/entities/users.entity';

@Entity('user_recipes')
@Unique(['user', 'recipeId'])
export class UserRecipes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    recipeId: number;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'jsonb' })
    recipe: SavedRecipe;
}
