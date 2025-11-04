const AWSStorageService = require('./AWSStorageService');
const AzureStorageService = require('./AzureStorageService');
const GCPStorageService = require('./GCPStorageService');

class CloudStorageFactory {
  constructor() {
    throw new Error('CloudStorageFactory is a static class and cannot be instantiated');
  }
}

// Singleton storage for each storage instance
CloudStorageFactory.instances = {};

CloudStorageFactory.createStorageService = function (provider, config) {
  // Check if the instance already exists
  const instanceKey = `${provider}-${config?.iId || config?.id || 'default'}`;
  if (!this.instances[instanceKey]) {
    // First check if the provider is in the list of supported providers
    const supportedProviders = ['s3', 'aws', 'azure', 'azurite', 'gcp', 'gcs', 'google'];
    const normalizedProvider = provider?.toLowerCase();
    
    if (!supportedProviders.includes(normalizedProvider)) {
      throw new Error(`Unsupported storage provider: ${provider}`);
    }

    // Create and store the instance based on the provider type
    switch (normalizedProvider) {
      case 's3':
      case 'aws':
        this.instances[instanceKey] = new AWSStorageService(config);
        break;
      case 'azure':
      case 'azurite':
        this.instances[instanceKey] = new AzureStorageService(config);
        break;
      case 'gcp':
      case 'gcs':
      case 'google':
        this.instances[instanceKey] = new GCPStorageService(config);
        break;
      default:
        throw new Error(`Unsupported storage provider: ${provider}`);
    }
  }

  return this.instances[instanceKey];
};

CloudStorageFactory.getProviderFromPath = function (path) {
  if (!path) return null;
  
  if (path.startsWith('s3://')) {
    return 's3';
  }
  if (path.startsWith('azure://') || path.startsWith('az://')) {
    return 'azure';
  }
  if (path.startsWith('gs://') || path.startsWith('gcp://')) {
    return 'gcp';
  }
  
  // Default to S3 if no protocol specified
  return 's3';
};

module.exports = CloudStorageFactory;

