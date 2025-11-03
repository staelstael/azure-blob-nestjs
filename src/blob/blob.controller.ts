// blob.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import { BlobService } from './blob.service';

@Controller('blobs')
export class BlobController {
  constructor(private readonly blobService: BlobService) {}

  // Upload a file using multipart/form-data
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file to Azure Blob Storage',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.blobService.uploadFromBuffer(file.originalname, file.buffer);
  }

  // List all blobs in the container
  @Get('listeblobs')
  async listBlobs() {
    return this.blobService.listBlobs();
  }

  // Delete all blobs in the container
  @Delete('deleteAllblobs')
  async deleteAllBlobs() {
    return this.blobService.deleteAllBlobs();
  }

  // Check if a specific blob exists
  @Get('findBlob')
  async findBlob(@Query('name') name: string) {
    if (!name) throw new BadRequestException('name is required');
    return { name, exists: await this.blobService.findBlob(name) };
  }
}
