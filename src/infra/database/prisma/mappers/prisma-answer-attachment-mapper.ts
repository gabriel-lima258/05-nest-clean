import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'
import { Prisma, Attachment as PrismaAttachment } from '@prisma/client'

// convert answerattachment prisma to a answerattachment domain
export class PrismaAnswerAttachmentMapper {
  // just domain method because there's no such convert and persistence action on DB
  static toDomain(raw: PrismaAttachment): AnswerAttachment {
    if (!raw.answerId) {
      throw new Error('Invalid attachment type')
    }

    return AnswerAttachment.create(
      {
        attachmentId: new UniqueEntityID(raw.id),
        answerId: new UniqueEntityID(raw.answerId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaUpdateMany(
    attachments: AnswerAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    // get attachments ids
    const attachmentIds = attachments.map((attachment) => {
      return attachment.attachmentId.toString()
    })

    // update attachments where in AnswerAttachment[] and set their answerId
    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        answerId: attachments[0].answerId.toString(),
      },
    }
  }
}
