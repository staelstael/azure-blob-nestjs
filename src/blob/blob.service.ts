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
    // Vérification des variables d'environnement
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

    // Authentification via SPN
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!,
    );

    // Client Blob
    const blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      credential,
    );

    // Conteneur
    this.containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!,
    );

    // Créer le conteneur s'il n'existe pas
    this.containerClient.createIfNotExists().catch((err) => {
      this.logger.error('Failed to create container', err.message);
    });
  }

  // Upload depuis buffer (mémoire) - FONCTIONNE EN DOCKER
  async uploadFromBuffer(blobName: string, buffer: Buffer) {
    this.logger.log(`Uploading blob: ${blobName} (${buffer.length} bytes)`);
    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(buffer, buffer.length);

    const url = blockBlobClient.url;
    this.logger.log(`Uploaded successfully: ${url}`);
    return { blobName, url };
  }

  // Lister les blobs
  async listBlobs(): Promise<string[]> {
    const blobs: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat()) {
      blobs.push(blob.name);
    }
    return blobs;
  }

  // Supprimer tous les blobs
  async deleteAllBlobs() {
    const blobs = await this.listBlobs();
    this.logger.log(`Deleting ${blobs.length} blobs...`);

    for (const blobName of blobs) {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      this.logger.log(`Deleted: ${blobName}`);
    }

    return { message: `Deleted ${blobs.length} blob(s)` };
  }

  // Vérifier l'existence d'un blob
  async findBlob(blobName: string): Promise<boolean> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    const exists = await blockBlobClient.exists();
    this.logger.log(`Blob "${blobName}" ${exists ? 'exists' : 'not found'}`);
    return exists;
  }
}
