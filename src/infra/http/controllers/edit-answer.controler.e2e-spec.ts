import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { AnswerAttachmentFactory } from 'test/factories/make-answer-attachment'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Edit answer (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let attachmentFactory: AttachmentFactory
  let answerAttachmentFactory: AnswerAttachmentFactory
  let jwt: JwtService

  beforeAll(async () => {
    // module to start server without the official server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ], // get factory instance
    }).compile()

    app = moduleRef.createNestApplication()

    // get prisma and jwt from inside the module
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /answers/:id', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent()

    // get its token
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    // create attachment
    const attachment1 = await attachmentFactory.makePrismaAttachment()
    const attachment2 = await attachmentFactory.makePrismaAttachment()

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    })

    // make a relation with attachment and answer
    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachment1.id,
      answerId: answer.id,
    })

    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachment2.id,
      answerId: answer.id,
    })

    // create a new attachment after the attachment has been created
    const attachment3 = await attachmentFactory.makePrismaAttachment()

    const answerId = answer.id.toString()

    // create a new question
    const response = await request(app.getHttpServer())
      .put(`/answers/${answerId}`)
      .set('Authorization', `Bearer ${accessToken}`) // set authorization
      .send({
        content: 'New content',
        attachments: [attachment1.id.toString(), attachment3.id.toString()],
      })

    expect(response.statusCode).toBe(204)

    // verify if the question created is on database by title
    const answerOnDatabase = await prisma.answer.findFirst({
      where: {
        content: 'New content',
      },
    })

    expect(answerOnDatabase).toBeTruthy()

    // verify how many attachment exist on database
    const attachmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        answerId: answerOnDatabase?.id,
      },
    })

    expect(attachmentsOnDatabase).toHaveLength(2)
    // expect that attachments 1 and 3 on database
    expect(attachmentsOnDatabase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: attachment1.id.toString(),
        }),
        expect.objectContaining({
          id: attachment3.id.toString(),
        }),
      ]),
    )
  })
})
