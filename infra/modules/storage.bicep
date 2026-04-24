param location string
param storageAccountName string

resource storage 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
}

resource staticWebsite 'Microsoft.Storage/storageAccounts/blobServices@2021-09-01' = {
  parent: storage
  name: 'default'
)

// Bicep doesn't natively enable static website via resource properties in basic Storage provider resource yet
// Usually requires a deployment script or Terraform, but we can output the URL logic.
// Note: For real world, static website is enabled via 'az storage blob service-properties update --account-name <name> --static-website --index-document index.html'

output name string = storage.name
output staticWebsiteUrl string = storage.properties.primaryEndpoints.web
