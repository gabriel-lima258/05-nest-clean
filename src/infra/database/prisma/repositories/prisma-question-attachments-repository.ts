import { PrismaQuestionAttachmentMapper } from './../mappers/prisma-question-attachemnt-mapper'
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaQuestionAttachmentsRepository
  implements QuestionAttachmentsRepository
{
  constructor(private prisma: PrismaService) {}

  async createMany(attachments: QuestionAttachment[]): Promise<void> {
    // if attachments is equal 0 return nothing
    if (attachments.length === 0) {
      return
    }

    const data = PrismaQuestionAttachmentMapper.toPrismaUpdateMany(attachments)

    // update the attachments with question id created
    await this.prisma.attachment.updateMany(data)
  }

  async deleteMany(attachments: QuestionAttachment[]): Promise<void> {
    // if attachments is equal 0 return nothing
    if (attachments.length === 0) {
      return
    }

    // get attachments ids
    const attachmentIds = attachments.map((attachment) => {
      return attachment.id.toString()
    })

    // delete all attachments inside the questionList
    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: attachmentIds,
        },
      },
    })
  }

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionAttachments = await this.prisma.attachment.findMany({
      where: {
        questionId,
      },
    })

    return questionAttachments.map(PrismaQuestionAttachmentMapper.toDomain)
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        questionId,
      },
    })
  }
}
