import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CreateQuestionUseCase } from './create-question'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-reepository'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: CreateQuestionUseCase // sut => system under test

describe('Create Question Use Case', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    )
    sut = new CreateQuestionUseCase(inMemoryQuestionsRepository)
  })

  it('it should be able to create a question', async () => {
    const result = await sut.execute({
      authorId: '1',
      title: 'New question',
      content: 'Content question',
      attachmentsIds: ['1', '2'],
    })

    // expect success and a question as response
    expect(result.isRight()).toBe(true)
    expect(inMemoryQuestionsRepository.items[0]).toEqual(result.value?.question)
    // expect 2 attachments and your id
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toHaveLength(2)
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toEqual([
      expect.objectContaining({ attachementId: new UniqueEntityID('1') }),
      expect.objectContaining({ attachementId: new UniqueEntityID('2') }),
    ])
  })

  it('it should persist attachments when create a new question', async () => {
    const result = await sut.execute({
      authorId: '1',
      title: 'New question',
      content: 'Content question',
      attachmentsIds: ['1', '2'],
    })

    // expect success and a question as response
    expect(result.isRight()).toBe(true)
    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(2)
    expect(inMemoryQuestionAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('2'),
        }),
      ]),
    )
  })
})
