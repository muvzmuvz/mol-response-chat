import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Client } from '../clients/client.entity';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client)
  client: Client;

  @Column()
  status: string;


  @Column({ type: 'datetime' }) // или 'datetime' в зависимости от БД
  date: Date;
}
