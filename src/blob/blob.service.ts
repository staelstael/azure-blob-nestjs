import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  BlobDeleteOptions,
} from '@azure/storage-blob';
import { ClientSecretCredential } from '@azure/identity';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!,
    );

    this.blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      credential,
    );

    this.containerClient = this.blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!,
    );
  }

  /**
   * Upload a blob to the container
   */
  async uploadBlob(blobName: string, filePath: string) {
    this.logger.log(`Uploading blob: ${blobName}`);
    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadFile(filePath);
    return { blobName, message: 'Uploaded successfully' };
  }

  /**
   * List all blobs in the container
   */
  async listBlobs(): Promise<string[]> {
    const blobs: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat()) {
      blobs.push(blob.name);
    }
    return blobs;
  }

  /**
   * Delete all blobs in the container
   */
  async deleteAllBlobs() {
    const blobs = await this.listBlobs();
    this.logger.log(
      `Deleting ${blobs.length} blobs from container: ${this.containerClient.containerName}`,
    );

    for (const blobName of blobs) {
      try {
        const blockBlobClient: BlockBlobClient =
          this.containerClient.getBlockBlobClient(blobName);

        const options: BlobDeleteOptions = { deleteSnapshots: 'include' };
        await blockBlobClient.delete(options);

        this.logger.log(`Deleted blob: ${blobName}`);
      } catch (error) {
        this.logger.error(`Failed to delete blob: ${blobName}`, error);
      }
    }

    return {
      container: this.containerClient.containerName,
      message: 'All deletable blobs processed',
    };
  }

  async findBlob(blobName: string): Promise<boolean> {
    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    this.logger.log(
      exists
        ? `Blob "${blobName}" exists in container ${this.containerClient.containerName}`
        : `Blob "${blobName}" does NOT exist in container ${this.containerClient.containerName}`,
    );

    return exists;
  }
}
