import { User } from 'src/users/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_calories')
@Index(['user', 'day'], { unique: true })
export class UserCalories {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'date' })
    day: string;

    @Column({
        nullable: false,
        type: 'integer',
    })
    calories: number;

    @CreateDateColumn()
    createdAt: Date;
}
