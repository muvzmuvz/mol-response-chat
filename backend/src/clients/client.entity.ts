import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Route } from '../route/route.entity';

// client.entity.ts
@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organization: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  status: string;

  @Column({ default: '' }) // добавлено поле комментария
  comment: string;

  @ManyToOne(() => Route, { eager: true, nullable: false })
  route: Route;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

