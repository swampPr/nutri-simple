import { User } from 'src/users/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import type { SavedRecipe } from '../types/recipe.type';

@Entity('user_recipes')
export class UserRecipes {
    @PrimaryGeneratedColumn()
    id: number;

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
