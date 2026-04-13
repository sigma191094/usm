import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get('*')
  serveFrontend(@Res() res: express.Response) {
    // Ensuring the path is resolved correctly relative to the project root
    const indexPath = join(process.cwd(), 'public', 'index.html');
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        // If index.html is missing, return a clear JSON error instead of crashing
        res.status(404).json({
          statusCode: 404,
          message: 'Frontend index.html not found in public folder.',
          error: 'Not Found'
        });
      }
    });
  }
}
