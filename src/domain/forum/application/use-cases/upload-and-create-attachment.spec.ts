import { FakeUploader } from 'test/storage/fake-uploader'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader
let sut: UploadAndCreateAttachmentUseCase // sut => system under test

describe('Upload and create attachment Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    fakeUploader = new FakeUploader()
    sut = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should be able to upload a file', async () => {
    const result = await sut.execute({
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    // expect success and a student as response
    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      attachment: inMemoryAttachmentsRepository.items[0],
    })
    expect(fakeUploader.uploads).toHaveLength(1)
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'profile.png',
      }),
    )
  })

  it('should not be able to create an upload with wrong file type', async () => {
    const result = await sut.execute({
      fileName: 'profile.mp3',
      fileType: 'image/mpeg',
      body: Buffer.from(''),
    })

    // expect success and a student as response
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })
})
