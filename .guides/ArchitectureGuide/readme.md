## Overview

![Overview](img/image_004.png)

The Application template has the following main components:

- [**Azure App Service**](#azure-app-service): Hosts the API endpoints, including the bot messaging endpoint.
- [**Azure Storage Account**](#azure-storage-account): Stores all application data, such as actors and requests.
- [**Azure Active Directory**](#azure-active-directory): Provides single sign-on for users in Teams. Also secures communication between the bot and Azure Bot Service.
- [**Microsoft Graph API**](#microsoft-graph-api): Provides integration with O365 for determining Microsoft Team Channels and SharePoint Document Libraries of the templates.

## Azure App Service
This service hosts the Api Endpoint as well as the bot activities required by the solution. The Api endpoint is used in both data access to the application and any notifications to be routed to channels.

## Azure Storage Account
Azure Storage Account stores all application data in various tables and blobs.

## Azure Active Directory
The Azure Active Directory provides the Authorization and Authentican channels for the teams and bot services to be able to communicate securely with each other. Users are also authenticated and authorized against the provider for a single sign on experience. 

## Microsoft Graph API
The Microsoft Graph API is used by the front end to retrieve channel information as well as migrate documents from Azure Storage Account to SharePoint.

Scopes required by the application

| Scope  | Type   | Description  | Admin Consent  |
|---|---|---|---|
| Channel.ReadBasic.All  | Delegated  | Read the names and descriptions of channels  | No  |
| Presence.Read.All  | Delegated  | Read presence information of all users in your organization  | No  |
| Sites.ReadWrite.All  | Application  | Read and write items in all site collections  | No  |
| Sites.ReadWrite.All  | Delegated  | Edit or delete items in all site collections  | No  |
| Team.ReadBasic.All  | Delegated  | Read the names and descriptions of teams  | No  |
| User.Read  | Delegated  |  Sign in and read user profile | No  |
| User.Read.All  | Application  | Read all users' full profiles  | Yes  |
| User.ReadBasic.All  | Delegated  | Read all users' basic profiles  | No  |
