import { Controller, Post, Body, Get, Delete, Query } from '@nestjs/common';
import { BlobService } from './blob.service';
import { UploadDto } from './dto/upload.dto';

@Controller('blobs')
export class BlobController {
  constructor(private readonly blobService: BlobService) {}

  @Post('/upload')
  async uploadBlob(@Body() uploadDto: UploadDto) {
    return this.blobService.uploadBlob(uploadDto.name, uploadDto.filePath);
  }

  @Get('/listeblobs')
  listBlobs() {
    return this.blobService.listBlobs();
  }

  @Delete('/deleteAllblobs')
  deleteAllBlobs() {
    return this.blobService.deleteAllBlobs();
  }
  @Get('/findBlob')
  findBlob(@Query('name') name: string) {
    return this.blobService.findBlob(name);
  }
}
