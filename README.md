# Azure Blob NestJS App

## Overview
NestJS app for uploading/listing/deleting blobs in Azure Storage.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill vars
3. `npm run start:dev`

## API
- POST /blobs/upload : Upload file (multipart/form-data)
- GET /blobs/listeblobs : List blobs
- DELETE /blobs/deleteAllblobs : Delete all
- GET /blobs/findBlob?name=foo : Check existence

## Swagger
http://localhost:3000/api

## Deploy
- Docker Hub: staeltchoupou333/azure-blob-nestjs
- Azure Container App: azure-blob-nestjs-app
