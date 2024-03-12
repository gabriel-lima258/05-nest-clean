import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionCommentsFactory } from 'test/factories/make-question-comment'
import { StudentFactory } from 'test/factories/make-student'

describe('Fetch question comments (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let questionCommentsFactory: QuestionCommentsFactory
  let jwt: JwtService

  beforeAll(async () => {
    // module to start server without the official server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentsFactory], // get factory instance
    }).compile()

    app = moduleRef.createNestApplication()

    // get prisma and jwt from inside the module
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    questionCommentsFactory = moduleRef.get(QuestionCommentsFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions/:questionId/comments', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent()

    // get its token
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    // promise all make many requests
    await Promise.all([
      questionCommentsFactory.makePrismaQuestionComments({
        authorId: user.id,
        questionId: question.id,
        content: 'Question comment 01',
      }),
      questionCommentsFactory.makePrismaQuestionComments({
        authorId: user.id,
        questionId: question.id,
        content: 'Question comment 02',
      }),
    ])

    const questionId = question.id.toString()

    // create many question
    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      questionComments: expect.arrayContaining([
        expect.objectContaining({ content: 'Question comment 01' }),
        expect.objectContaining({ content: 'Question comment 02' }),
      ]),
    })
  })
})
