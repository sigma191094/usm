import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'USM Media API is running';
  }
}
