const AWS = require('aws-sdk');
const CloudStorageInterface = require('./CloudStorageInterface');

class AWSStorageService extends CloudStorageInterface {
  constructor(config) {
    super('aws', config);
    this.s3 = new AWS.S3({
      accessKeyId: this.config?.credentials?.accessKey,
      secretAccessKey: this.config?.credentials?.secretKey,
      region: this.config?.region,
    });
  }

  async validateAuthentication() {
    try {
      await this.s3.listBuckets().promise();
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
      const urlWithoutProtocol = folderPath.replace(/^s3:\/\//, '');
      const [bucketName, ...prefixParts] = urlWithoutProtocol.split('/');
      const prefix = prefixParts.join('/');
      return {
        containerName: bucketName,
        bucketName, // Alias for compatibility
        path: prefix,
      };
    } catch (error) {
      const errorMsg = `Error while parsing S3 folder path: ${error.message}`;
      console.error(errorMsg);
      throw new Error(`Invalid S3 folder path format: ${folderPath}`);
    }
  }

  async getObject(filePath) {
    try {
      const { bucketName, path } = AWSStorageService.parsePath(filePath);
      const s3Params = { Bucket: bucketName, Key: path };
      const response = await this.s3.getObject(s3Params).promise();
      return response.Body.toString();
    } catch (error) {
      console.error(`Error while getting S3 object: ${error.message}`);
      throw error;
    }
  }

  async listObjects(path) {
    try {
      const { bucketName, path: prefix } = AWSStorageService.parsePath(path);
      const params = {
        Bucket: bucketName,
        Prefix: prefix,
      };
      const response = await this.s3.listObjectsV2(params).promise();
      return response.Contents || [];
    } catch (error) {
      console.error(`Error while listing S3 objects: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AWSStorageService;

