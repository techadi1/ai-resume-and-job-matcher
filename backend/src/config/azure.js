/**
 * Azure Cloud Configuration & SDK Providers
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');
const appInsights = require('applicationinsights');
const env = require('./env');
const logger = require('../utils/logger');

// Initialize Azure Application Insights if connection string is configured
let isTelemetryInitialized = false;
if (env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  try {
    appInsights.setup(env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();
    isTelemetryInitialized = true;
    logger.info('Azure Application Insights initialized successfully');
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to initialize Azure Application Insights');
  }
}

// Azure Blob Storage Client Factory
let blobServiceClient = null;
const getBlobServiceClient = () => {
  if (blobServiceClient) return blobServiceClient;

  if (env.AZURE_STORAGE_CONNECTION_STRING) {
    try {
      blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
      logger.info('Azure BlobServiceClient initialized via Connection String');
      return blobServiceClient;
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to initialize BlobServiceClient from connection string');
    }
  }
  return null;
};

// Azure Key Vault Client Factory
let secretClient = null;
const getSecretClient = () => {
  if (secretClient) return secretClient;

  if (env.AZURE_KEY_VAULT_URL) {
    try {
      const credential = new DefaultAzureCredential();
      secretClient = new SecretClient(env.AZURE_KEY_VAULT_URL, credential);
      logger.info('Azure SecretClient initialized for Key Vault');
      return secretClient;
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to initialize Key Vault client');
    }
  }
  return null;
};

module.exports = {
  isTelemetryInitialized,
  getBlobServiceClient,
  getSecretClient,
};
