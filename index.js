const CloudStorageFactory = require('./lib/CloudStorageFactory');
const CloudStorageInterface = require('./lib/CloudStorageInterface');
const AWSStorageService = require('./lib/AWSStorageService');
const AzureStorageService = require('./lib/AzureStorageService');
const GCPStorageService = require('./lib/GCPStorageService');

module.exports = {
  CloudStorageFactory,
  CloudStorageInterface,
  AWSStorageService,
  AzureStorageService,
  GCPStorageService,
};

