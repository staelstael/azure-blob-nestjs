// src/dto/file-upload.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Fichier à uploader',
  })
  file: any;
}
