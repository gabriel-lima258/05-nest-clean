import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  AnswerComment,
  AnswerCommentProps,
} from '@/domain/forum/enterprise/entities/answer-comment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaAnswerCommentMapper } from '@/infra/database/prisma/mappers/prisma-answer-comment-mapper'

// partial transform any props opcional
export function makeAnswerComment(
  override: Partial<AnswerCommentProps> = {},
  id?: UniqueEntityID,
) {
  const answerComment = AnswerComment.create(
    {
      authorId: new UniqueEntityID(),
      answerId: new UniqueEntityID(),
      content: faker.lorem.text(),
      ...override,
    },
    id, // if exist an id get it
  )

  return answerComment
}

@Injectable()
export class AnswerCommentsFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAnswerComments(
    data: Partial<AnswerCommentProps> = {},
  ): Promise<AnswerComment> {
    // get data from domain
    const answerComment = makeAnswerComment(data)

    // setting DB to entity
    await this.prisma.comment.create({
      data: PrismaAnswerCommentMapper.toPrisma(answerComment),
    })

    return answerComment
  }
}
