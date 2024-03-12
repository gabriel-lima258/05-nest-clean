import {
  UploadParams,
  Uploader,
} from '@/domain/forum/application/storage/uploader'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { EnvService } from '../env/env.service'
import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class R2Storage implements Uploader {
  // connection to the server aws
  private client: S3Client

  constructor(private envService: EnvService) {
    const accountId = envService.get('CLOUDFLARE_ACCOUNT_ID')

    this.client = new S3Client({
      // endpoint is S3 API from bucket
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<{ url: string }> {
    // create an unique filename
    const uploadId = randomUUID()
    const uniqueFilename = `${uploadId}-${fileName}`

    // send new upload file
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get('AWS_BUCKET_NAME'),
        Key: uniqueFilename, // name file
        ContentType: fileType, // file type
        Body: body, // content file
      }),
    )

    // save a reference name on database as url
    return {
      url: uniqueFilename,
    }
  }
}
