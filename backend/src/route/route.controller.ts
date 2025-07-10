  import { Controller, Get, Post, Body } from '@nestjs/common';
  import { RouteService } from './route.service';

  @Controller('routes')
  export class RouteController {
    constructor(private svc: RouteService) {}

    @Post()
    create(@Body('title') title: string) {
      return this.svc.create(title);
    }

    @Get()
    findAll() {
      return this.svc.findAll();
    }
  }
