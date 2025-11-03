import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { ClientSecretCredential } from '@azure/identity';

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private containerClient: ContainerClient;

  constructor() {
    // Check for required environment variables
    const requiredEnv = [
      'AZURE_TENANT_ID',
      'AZURE_CLIENT_ID',
      'AZURE_CLIENT_SECRET',
      'AZURE_STORAGE_ACCOUNT_NAME',
      'AZURE_STORAGE_CONTAINER_NAME',
    ];

    for (const env of requiredEnv) {
      if (!process.env[env]) {
        throw new Error(`Missing environment variable: ${env}`);
      }
    }

    // Authenticate using Service Principal (SPN)
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!,
    );

    // Initialize Blob Service Client
    const blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      credential,
    );

    // Get container client
    this.containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!,
    );

    // Create container if it doesn't exist
    this.containerClient.createIfNotExists().catch((err) => {
      this.logger.error('Failed to create container', err.message);
    });
  }

  // Upload blob from memory buffer
  async uploadFromBuffer(blobName: string, buffer: Buffer) {
    this.logger.log(`Uploading blob: ${blobName} (${buffer.length} bytes)`);
    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(buffer, buffer.length);

    const url = blockBlobClient.url;
    this.logger.log(`Uploaded successfully: ${url}`);
    return { blobName, url };
  }

  // List all blobs in the container
  async listBlobs(): Promise<string[]> {
    const blobs: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat()) {
      blobs.push(blob.name);
    }
    return blobs;
  }

  // Delete all blobs in the container
  async deleteAllBlobs() {
    const blobs = await this.listBlobs();
    this.logger.log(`Deleting ${blobs.length} blob(s)...`);

    for (const blobName of blobs) {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      this.logger.log(`Deleted: ${blobName}`);
    }

    return { message: `Deleted ${blobs.length} blob(s)` };
  }

  // Check if a blob exists
  async findBlob(blobName: string): Promise<boolean> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    const exists = await blockBlobClient.exists();
    this.logger.log(`Blob "${blobName}" ${exists ? 'exists' : 'not found'}`);
    return exists;
  }
}
