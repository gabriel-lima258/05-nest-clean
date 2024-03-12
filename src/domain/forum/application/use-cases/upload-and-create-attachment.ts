import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentRepository } from '../repositories/attachment-repository'
import { Uploader } from '../storage/uploader'

interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentTypeError,
  {
    attachment: Attachment
  }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    // regex to validate mimetype of jpg, pdf, png and jpeg
    if (!/^(image\/(jpeg|png))$|^application\/pdf$/.test(fileType)) {
      // if don't validate throw an error
      return left(new InvalidAttachmentTypeError(fileType))
    }

    // before to set attachement to DB, get url from uploader
    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    const attachment = Attachment.create({
      title: fileName,
      url, // set from uploader file
    })

    // save on repository
    await this.attachmentRepository.create(attachment)

    return right({
      attachment,
    })
  }
}
