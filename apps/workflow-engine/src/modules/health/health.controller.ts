import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ContentFlow AI Workflow Engine',
      version: '1.0.0',
    };
  }
}
