import { Either, left, right } from '@/core/either'
import { Answer } from '../../enterprise/entities/answer'
import { AnswerRepository } from '../repositories/answer-repository'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFound } from '@/core/errors/errors/resource-not-found'
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'

interface EditAnswerUseCaseRequest {
  authorId: string
  answerId: string
  content: string
  attachmentsIds: string[]
}

type EditAnswerUseCaseResponse = Either<
  ResourceNotFound | NotAllowedError,
  {
    answer: Answer
  }
>

@Injectable()
export class EditAnswerUseCase {
  constructor(
    private answerRepository: AnswerRepository,
    private answerAttachementsRepository: AnswerAttachmentsRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
    attachmentsIds,
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    // finding the answer by id
    const answer = await this.answerRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFound())
    }

    if (authorId !== answer.authorId.toString()) {
      return left(new NotAllowedError())
    }

    // search previous attachments before edit
    const currentAnswerAttachments =
      await this.answerAttachementsRepository.findManyByAnswerId(answerId)
    // set attachments to watched list
    const answerAttachmentsList = new AnswerAttachmentList(
      currentAnswerAttachments,
    )

    // run the array of attachments id and create attachment
    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        answerId: answer.id,
        attachmentId: new UniqueEntityID(attachmentId),
      })
    })

    // compare the previues list of attachments with the new one
    answerAttachmentsList.update(answerAttachments)

    // changing the content and title
    answer.content = content
    answer.attachments = answerAttachmentsList

    // edit a answer
    await this.answerRepository.save(answer)

    return right({
      answer,
    })
  }
}
