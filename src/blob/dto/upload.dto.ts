import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  @ApiProperty({ description: 'Name of the blob' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Path to the local file' })
  @IsString()
  @IsNotEmpty()
  filePath: string;
}
