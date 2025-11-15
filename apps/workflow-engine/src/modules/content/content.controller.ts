import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('generate')
  async generateContent(
    @Body() dto: { topic: string; userId: string },
  ): Promise<any> {
    return this.contentService.generateContent(dto.topic, dto.userId);
  }

  @Get(':id')
  async getContent(@Param('id') contentId: string): Promise<any> {
    return this.contentService.getContent(contentId);
  }
}
