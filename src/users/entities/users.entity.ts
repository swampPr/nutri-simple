import type { Latitude, Longitude } from 'src/common/types/geo.types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 20, type: 'varchar' })
    userName: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'double precision',
        nullable: true,
    })
    lat?: Latitude;

    @Column({
        type: 'double precision',
        nullable: true,
    })
    lon?: Longitude;

    @Column({
        nullable: true,
    })
    locationName?: string;

    @Column({
        type: 'integer',
        nullable: true,
    })
    calorieGoal?: number;
}
