import { User } from 'src/server/users/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokens {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ unique: true })
    tokenHash: string;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
