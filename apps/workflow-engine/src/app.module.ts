import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { ContentModule } from './modules/content/content.module';
import { AiModule } from './modules/ai/ai.module';
import { QueueModule } from './modules/queue/queue.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { SheetsModule } from './modules/sheets/sheets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    ContentModule,
    AiModule,
    QueueModule,
    DistributionModule,
    SheetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
