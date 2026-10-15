/**
 * Storage Service Abstraction (Local Disk vs Azure Blob Storage)
 */

const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { STORAGE_PROVIDERS } = require('../constants');
const AzureBlobStorageProvider = require('../integrations/blobStorage');
const logger = require('../utils/logger');
const { StorageError } = require('../errors/AppError');

class LocalStorageProvider {
  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer, storageKey) {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      await fs.promises.writeFile(filePath, fileBuffer);
      logger.info({ filePath }, 'Saved file to Local Storage');
      return { storageKey, url: `/uploads/${storageKey}` };
    } catch (err) {
      logger.error({ err: err.message, storageKey }, 'Local storage upload error');
      throw new StorageError(`Local storage save failed: ${err.message}`);
    }
  }

  async download(storageKey) {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      return await fs.promises.readFile(filePath);
    } catch (err) {
      logger.error({ err: err.message, storageKey }, 'Local storage download error');
      throw new StorageError(`Local storage read failed: ${err.message}`);
    }
  }

  async delete(storageKey) {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (err) {
      logger.error({ err: err.message, storageKey }, 'Local storage delete error');
      throw new StorageError(`Local storage delete failed: ${err.message}`);
    }
  }

  async getUrl(storageKey) {
    return `/uploads/${storageKey}`;
  }

  getLocalFilePath(storageKey) {
    return path.join(this.uploadDir, storageKey);
  }
}

class StorageService {
  constructor() {
    if (env.AZURE_STORAGE_CONNECTION_STRING) {
      this.provider = new AzureBlobStorageProvider();
      this.providerType = STORAGE_PROVIDERS.AZURE_BLOB;
      logger.info('StorageService initialized with AzureBlobStorageProvider');
    } else {
      this.provider = new LocalStorageProvider();
      this.providerType = STORAGE_PROVIDERS.LOCAL;
      logger.info('StorageService initialized with LocalStorageProvider');
    }
  }

  getProviderType() {
    return this.providerType;
  }

  async upload(fileBuffer, originalFileName, mimeType) {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8);
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `${timestamp}_${randomHex}_${sanitizedName}`;

    const result = await this.provider.upload(fileBuffer, storageKey, mimeType);
    return {
      storageKey,
      storageProvider: this.providerType,
      url: result.url,
    };
  }

  async download(storageKey) {
    return this.provider.download(storageKey);
  }

  async delete(storageKey) {
    return this.provider.delete(storageKey);
  }

  async getUrl(storageKey) {
    return this.provider.getUrl(storageKey);
  }

  getLocalFilePath(storageKey) {
    if (this.provider instanceof LocalStorageProvider) {
      return this.provider.getLocalFilePath(storageKey);
    }
    return null;
  }
}

module.exports = new StorageService();
