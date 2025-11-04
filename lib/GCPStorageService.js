const { Storage } = require('@google-cloud/storage');
const CloudStorageInterface = require('./CloudStorageInterface');

class GCPStorageService extends CloudStorageInterface {
  constructor(config) {
    super('gcp', config);
    
    // GCP credentials can be provided as:
    // 1. Path to service account key file
    // 2. Service account key object
    // 3. Environment variable GOOGLE_APPLICATION_CREDENTIALS
    const credentials = this.config?.credentials;
    
    const storageOptions = {};
    
    if (credentials?.keyFilename) {
      storageOptions.keyFilename = credentials.keyFilename;
    } else if (credentials?.projectId && credentials?.clientEmail && credentials?.privateKey) {
      storageOptions.projectId = credentials.projectId;
      storageOptions.credentials = {
        client_email: credentials.clientEmail,
        private_key: credentials.privateKey,
      };
    }
    
    this.storage = new Storage(storageOptions);
  }

  async validateAuthentication() {
    try {
      // List buckets to verify authentication
      const [buckets] = await this.storage.getBuckets();
      return {
        status: 'success',
        message: 'Authentication verified',
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
      };
    }
  }

  static parsePath(folderPath) {
    try {
      // Support both gs:// and gcp:// protocols
      const urlWithoutProtocol = folderPath.replace(/^gs:\/\//, '').replace(/^gcp:\/\//, '');
      const [bucketName, ...prefixParts] = urlWithoutProtocol.split('/');
      const prefix = prefixParts.join('/');
      return {
        containerName: bucketName,
        bucketName, // Alias for compatibility
        path: prefix,
      };
    } catch (error) {
      const errorMsg = `Error while parsing GCP folder path: ${error.message}`;
      console.error(errorMsg);
      throw new Error(`Invalid GCP folder path format: ${folderPath}`);
    }
  }

  async getObject(filePath) {
    try {
      const { bucketName, path } = GCPStorageService.parsePath(filePath);
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(path);
      const [contents] = await file.download();
      return contents.toString();
    } catch (error) {
      console.error(`Error while getting GCP object: ${error.message}`);
      throw error;
    }
  }

  async listObjects(path) {
    try {
      const { bucketName, path: prefix } = GCPStorageService.parsePath(path);
      const bucket = this.storage.bucket(bucketName);
      const [files] = await bucket.getFiles({ prefix });
      return files.map((file) => ({
        name: file.name,
        size: file.metadata.size,
        updated: file.metadata.updated,
      }));
    } catch (error) {
      console.error(`Error while listing GCP objects: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GCPStorageService;

