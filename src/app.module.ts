import { Module } from '@nestjs/common';
import { BlobModule } from './blob/blob.module';

@Module({
  imports: [BlobModule],
})
export class AppModule {}
