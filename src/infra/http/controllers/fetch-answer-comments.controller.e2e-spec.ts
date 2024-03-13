import { AnswerCommentsFactory } from './../../../../test/factories/make-answer-comment'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Fetch answer comments (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let answerCommentsFactory: AnswerCommentsFactory
  let jwt: JwtService

  beforeAll(async () => {
    // module to start server without the official server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AnswerCommentsFactory,
      ], // get factory instance
    }).compile()

    app = moduleRef.createNestApplication()

    // get prisma and jwt from inside the module
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    answerCommentsFactory = moduleRef.get(AnswerCommentsFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /answers/:answerId/comments', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent({
      name: 'Gabriel Lima',
    })

    // get its token
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    // promise all make many requests
    await Promise.all([
      answerCommentsFactory.makePrismaAnswerComments({
        authorId: user.id,
        answerId: answer.id,
        content: 'Answer comment 01',
      }),
      answerCommentsFactory.makePrismaAnswerComments({
        authorId: user.id,
        answerId: answer.id,
        content: 'Answer comment 02',
      }),
    ])

    const answerId = answer.id.toString()

    // create many question
    const response = await request(app.getHttpServer())
      .get(`/answers/${answerId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      answerComments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Answer comment 01',
          authorName: 'Gabriel Lima',
        }),
        expect.objectContaining({
          content: 'Answer comment 02',
          authorName: 'Gabriel Lima',
        }),
      ]),
    })
  })
})
