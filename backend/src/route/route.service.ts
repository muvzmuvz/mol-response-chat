import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './route.entity';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private repo: Repository<Route>,
  ) {}

  create(title: string) {
    const r = this.repo.create({ title });
    return this.repo.save(r);
  }

  findAll() {
    return this.repo.find();
  }

  findByTitle(title: string) {
    return this.repo.findOne({ where: { title } });
  }

  findOrCreate(title: string) {
    return this.findByTitle(title).then(found => {
      return found || this.create(title);
    });
  }
}