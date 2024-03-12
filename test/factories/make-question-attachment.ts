import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/forum/enterprise/entities/question-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

// partial transform any props opcional
export function makeQuestionAttachment(
  override: Partial<QuestionAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const questionAttachment = QuestionAttachment.create(
    {
      attachmentId: new UniqueEntityID(),
      questionId: new UniqueEntityID(),
      ...override,
    },
    id, // if exist an id get it
  )

  return questionAttachment
}

// factory for e2e tests
@Injectable()
export class QuestionAttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaQuestionAttachment(
    data: Partial<QuestionAttachmentProps> = {},
  ): Promise<QuestionAttachment> {
    // get data from domain
    const questionAttachment = makeQuestionAttachment(data)

    // update the attachment with question id
    await this.prisma.attachment.update({
      where: {
        id: questionAttachment.attachmentId.toString(),
      },
      data: {
        questionId: questionAttachment.questionId.toString(),
      },
    })

    return questionAttachment
  }
}
