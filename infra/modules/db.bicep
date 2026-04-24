param location string
param serverName string
param adminPassword string @secure()
param databaseName string = 'kairos_db'

@allowed([
  'Basic'
  'GP_S_Gen5_1' // Serverless example
])
param skuName string = 'Basic'

resource sqlServer 'Microsoft.Sql/servers@2021-11-01' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: 'kairos_admin'
    administratorLoginPassword: adminPassword
    version: '12.0'
    publicNetworkAccess: 'Enabled'
    restrictOutboundNetworkAccess: 'Disabled'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: {
    name: skuName
    # (Basic = DTU model, GP_S = Serverless vCore model)
    tier: skuName == 'Basic' ? 'Basic' : 'GeneralPurpose'
    family: skuName == 'Basic' ? null : 'Gen5'
    capacity: skuName == 'Basic' ? 5 : 1
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: skuName == 'Basic' ? 2147483648 : 34359738368
    # Config for Serverless auto-pause
    autoPauseDelay: skuName == 'Basic' ? -1 : 60
    minCapacity: skuName == 'Basic' ? null : json('0.5')
  }
}

resource firewall 'Microsoft.Sql/servers/firewallRules@2021-11-01' = {
  parent: sqlServer
  name: 'AllowAllAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output host string = sqlServer.properties.fullyQualifiedDomainName
output dbName string = sqlDatabase.name
output user string = sqlServer.properties.administratorLogin
