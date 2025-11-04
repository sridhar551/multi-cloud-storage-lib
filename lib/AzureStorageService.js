const { BlobServiceClient } = require('@azure/storage-blob');
const CloudStorageInterface = require('./CloudStorageInterface');

class AzureStorageService extends CloudStorageInterface {
  constructor(config) {
    super('azure', config);
    const connectionString = this.config?.credentials?.connectionString;
    const accountName = this.config?.credentials?.accountName;
    const accountKey = this.config?.credentials?.accountKey;
    
    if (connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else if (accountName && accountKey) {
      const accountUrl = `https://${accountName}.blob.core.windows.net`;
      this.blobServiceClient = new BlobServiceClient(accountUrl, {
        credential: {
          accountName,
          accountKey,
        },
      });
    } else {
      throw new Error('Azure credentials must include either connectionString or (accountName and accountKey)');
    }
  }

  async validateAuthentication() {
    try {
      // List containers to verify authentication
      const containers = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const container of this.blobServiceClient.listContainers()) {
        containers.push(container);
      }
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
      // Support both azure:// and az:// protocols
      const urlWithoutProtocol = folderPath.replace(/^azure:\/\//, '').replace(/^az:\/\//, '');
      const [containerName, ...prefixParts] = urlWithoutProtocol.split('/');
      const prefix = prefixParts.join('/');
      return {
        containerName,
        bucketName: containerName, // Alias for compatibility
        path: prefix,
      };
    } catch (error) {
      const errorMsg = `Error while parsing Azure folder path: ${error.message}`;
      console.error(errorMsg);
      throw new Error(`Invalid Azure folder path format: ${folderPath}`);
    }
  }

  async getObject(filePath) {
    try {
      const { containerName, path } = AzureStorageService.parsePath(filePath);
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(path);
      const response = await blobClient.download();
      const content = await this.streamToString(response.readableStreamBody);
      return content;
    } catch (error) {
      console.error(`Error while getting Azure blob: ${error.message}`);
      throw error;
    }
  }

  async listObjects(path) {
    try {
      const { containerName, path: prefix } = AzureStorageService.parsePath(path);
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const objects = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        objects.push(blob);
      }
      return objects;
    } catch (error) {
      console.error(`Error while listing Azure blobs: ${error.message}`);
      throw error;
    }
  }

  // Helper method to convert stream to string
  async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }
}

module.exports = AzureStorageService;

