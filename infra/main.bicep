targetScope = 'subscription'

param location string = 'westeurope'
param projectName string = 'kairos'
param environment string = 'prod'
param dbAdminPassword string @secure()

@allowed([
  'Basic'
  'GP_S_Gen5_1'
])
param dbSku string = 'Basic'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${projectName}-${environment}'
  location: location
}

module registry './modules/registry.bicep' = {
  scope: rg
  name: 'registryDeployment'
  params: {
    location: location
    registryName: 'acr${projectName}${uniqueString(rg.id)}'
  }
}

module storage './modules/storage.bicep' = {
  scope: rg
  name: 'storageDeployment'
  params: {
    location: location
    storageAccountName: 'st${projectName}${uniqueString(rg.id)}'
  }
}

module database './modules/db.bicep' = {
  scope: rg
  name: 'databaseDeployment'
  params: {
    location: location
    serverName: 'sql-${projectName}-${environment}'
    adminPassword: dbAdminPassword
    skuName: dbSku
  }
}

module aca './modules/aca.bicep' = {
  scope: rg
  name: 'acaDeployment'
  params: {
    location: location
    projectName: projectName
    environment: environment
    acrName: registry.outputs.name
    dbHost: database.outputs.host
    dbName: database.outputs.dbName
    dbUser: database.outputs.user
    dbPassword: dbAdminPassword
  }
}

output acrLoginServer string = registry.outputs.loginServer
output frontendUrl string = storage.outputs.staticWebsiteUrl
output backendUrl string = aca.outputs.url
