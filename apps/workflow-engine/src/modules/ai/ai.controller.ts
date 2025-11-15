import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generateContent(@Body() dto: { prompt: string; userId: string }): Promise<any> {
    return this.aiService.callMultipleLLMs(dto.prompt, {});
  }
}
