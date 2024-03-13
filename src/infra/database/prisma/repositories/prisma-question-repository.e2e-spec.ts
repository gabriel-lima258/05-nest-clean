import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { AppModule } from '@/infra/app.module'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { CacheModule } from '@/infra/cache/cache.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachment'
import { StudentFactory } from 'test/factories/make-student'

describe('Prisma question repository (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let cacheRepository: CacheRepository
  let questionRepository: QuestionRepository

  beforeAll(async () => {
    // module to start server without the official server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ], // get factory instance
    }).compile()

    app = moduleRef.createNestApplication()

    // get prisma and jwt from inside the module
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)
    cacheRepository = moduleRef.get(CacheRepository)
    questionRepository = moduleRef.get(QuestionRepository)

    await app.init()
  })

  // if it is getting the cache
  it('should cache question details', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent()

    // create question
    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment()

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachment.id,
      questionId: question.id,
    })

    const slug = question.slug.value

    // executing the method with cache information
    const questionDetails = await questionRepository.findDetailsBySlug(slug)

    // verify if cache was successfully created
    const cached = await cacheRepository.get(`question:${slug}:details`)

    // expect cache has been created with question details
    expect(cached).toEqual(JSON.stringify(questionDetails))
  })

  // if it is setting a cache and get next time
  it('should return cached question details on subsequent calls', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent()

    // create question
    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment()

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachment.id,
      questionId: question.id,
    })

    const slug = question.slug.value

    // create a cache and expect it to be cached next time
    await cacheRepository.set(
      `question:${slug}:details`,
      JSON.stringify({ empty: true }),
    )

    // executing the method with cache information
    const questionDetails = await questionRepository.findDetailsBySlug(slug)

    // expect cache has been created with question details
    expect(questionDetails).toEqual({ empty: true })
  })

  // if it is deleting the cache
  it('should reset question details cache when saving the question', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent()

    // create question
    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment()

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachment.id,
      questionId: question.id,
    })

    const slug = question.slug.value

    // create a cache and expect it to be cached next time
    await cacheRepository.set(
      `question:${slug}:details`,
      JSON.stringify({ empty: true }),
    )

    // delete the cache when update question
    await questionRepository.save(question)

    // verify if cache was successfully created
    const cached = await cacheRepository.get(`question:${slug}:details`)

    // expect cache has been deleted and null is returned
    expect(cached).toBeNull()
  })
})
