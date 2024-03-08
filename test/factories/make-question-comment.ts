import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  QuestionComment,
  QuestionCommentProps,
} from '@/domain/forum/enterprise/entities/question-comment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaQuestionCommentMapper } from '@/infra/database/prisma/mappers/prisma-question-comment-mapper'

// partial transform any props opcional
export function makeQuestionComment(
  override: Partial<QuestionCommentProps> = {},
  id?: UniqueEntityID,
) {
  const questionComment = QuestionComment.create(
    {
      authorId: new UniqueEntityID(),
      questionId: new UniqueEntityID(),
      content: faker.lorem.text(),
      ...override,
    },
    id, // if exist an id get it
  )

  return questionComment
}

@Injectable()
export class QuestionCommentsFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaQuestionComments(
    data: Partial<QuestionCommentProps> = {},
  ): Promise<QuestionComment> {
    // get data from domain
    const questionComment = makeQuestionComment(data)

    // setting DB to entity
    await this.prisma.comment.create({
      data: PrismaQuestionCommentMapper.toPrisma(questionComment),
    })

    return questionComment
  }
}
