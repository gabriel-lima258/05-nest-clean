import { InvalidAttachmentTypeError } from '@/domain/forum/application/use-cases/errors/invalid-attachment-type'
import { UploadAndCreateAttachmentUseCase } from '@/domain/forum/application/use-cases/upload-and-create-attachment'
import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('/attachments')
export class UploadAttachmentController {
  constructor(
    private uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file')) // name file
  async handle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb file size
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg|pdf)', // type files accept
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadAndCreateAttachment.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    })

    // verify if there's error inside from the use case
    if (result.isLeft()) {
      const error = result.value

      // use the nest error to build the error message
      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message) // 401
        default:
          throw new BadRequestException(error.message) // 400
      }
    }

    const { attachment } = result.value

    return {
      attachmentId: attachment.id.toString(),
    }
  }
}
