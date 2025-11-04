/**
 * Abstract interface for cloud storage services
 * All storage implementations must extend this class
 */
class CloudStorageInterface {
  constructor(provider, config) {
    if (this.constructor === CloudStorageInterface) {
      throw new Error('CloudStorageInterface is an abstract class and cannot be instantiated');
    }
    this.provider = provider;
    this.config = config;
  }

  /**
   * Validate authentication/credentials
   * @returns {Promise<Object>} Validation result
   */
  async validateAuthentication() {
    throw new Error('validateAuthentication method must be implemented');
  }

  /**
   * Parse storage path (bucket/container name and file path)
   * @param {string} path - Storage path (e.g., s3://bucket/path, azure://container/path)
   * @returns {Object} Parsed object with container/bucket name and path
   */
  static parsePath(path) {
    throw new Error('parsePath method must be implemented');
  }

  /**
   * Get object/file from storage
   * @param {string} filePath - Full path to the file
   * @returns {Promise<string>} File content as string
   */
  async getObject(filePath) {
    throw new Error('getObject method must be implemented');
  }

  /**
   * List objects in a path
   * @param {string} path - Path to list
   * @returns {Promise<Array>} List of objects
   */
  async listObjects(path) {
    throw new Error('listObjects method must be implemented');
  }
}

module.exports = CloudStorageInterface;

