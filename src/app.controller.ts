import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get('*')
  serveFrontend(@Res() res: express.Response) {
    // Ensuring the path is resolved correctly relative to this file's location
    const indexPath = join(__dirname, '..', '..', 'public', 'index.html');
    res.sendFile(indexPath);
  }
}
