param location string
param projectName string
param environment string
param acrName string
param dbHost string
param dbName string
param dbUser string
param dbPassword string @secure()

resource env 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: 'cae-${projectName}-${environment}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2021-06-01' = {
  name: 'log-${projectName}-${environment}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2022-03-01' = {
  name: 'ca-${projectName}-backend'
  location: location
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
      }
      registries: [
        {
          server: '${acrName}.azurecr.io'
          username: acrName
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: 'DUMMY_VALUE_REPLACE_WITH_REAL_ACR_PWD_IN_CI' // Usually set via CLI
        }
        {
          name: 'db-password'
          value: dbPassword
        }
      ]
    }
    template: {
      containers: [
        {
          image: '${acrName}.azurecr.io/${projectName}-backend:latest'
          name: 'backend'
          env: [
            {
              name: 'DATABASE_URL'
              value: 'mssql+aioodbc://${dbUser}:${dbPassword}@${dbHost}/${dbName}'
            }
            {
              name: 'AI_PROVIDER'
              value: 'google'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

output url string = containerApp.properties.configuration.ingress.fqdn
