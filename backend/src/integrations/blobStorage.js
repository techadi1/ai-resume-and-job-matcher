/**
 * Azure Blob Storage Provider Implementation
 */

const { getBlobServiceClient } = require('../config/azure');
const env = require('../config/env');
const logger = require('../utils/logger');
const { StorageError } = require('../errors/AppError');

class AzureBlobStorageProvider {
  constructor() {
    this.containerName = env.AZURE_STORAGE_CONTAINER;
  }

  getContainerClient() {
    const serviceClient = getBlobServiceClient();
    if (!serviceClient) {
      throw new StorageError('Azure Blob Service Client is not initialized');
    }
    return serviceClient.getContainerClient(this.containerName);
  }

  async upload(fileBuffer, storageKey, mimeType) {
    try {
      const containerClient = this.getContainerClient();
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(storageKey);

      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: mimeType },
      });

      logger.info({ storageKey }, 'Uploaded file to Azure Blob Storage');
      return { storageKey, url: blockBlobClient.url };
    } catch (err) {
      logger.error({ err: err.message, storageKey }, 'Azure Blob upload error');
      throw new StorageError(`Azure Blob upload failed: ${err.message}`);
    }
  }

  async download(storageKey) {
    try {
      const containerClient = this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(storageKey);
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      return await this._streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    } catch (err) {
      logger.error({ err: err.message, storageKey }, 'Azure Blob download error');
      throw new StorageError(`Azure Blob download failed: ${err.message}`);
    }
  }

  async delete(storageKey) {
    try {
      const containerClient = this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(storageKey);
      await blockBlobClient.deleteIfExists();
      logger.info({ storageKey }, 'Deleted file from Azure Blob Storage');
      return true;
    } catch (err) {
      logger.error({ err: err.message, storageKey }, 'Azure Blob delete error');
      throw new StorageError(`Azure Blob delete failed: ${err.message}`);
    }
  }

  async getUrl(storageKey) {
    const containerClient = this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(storageKey);
    return blockBlobClient.url;
  }

  async _streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }
}

module.exports = AzureBlobStorageProvider;
