import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswerRepository } from '@/domain/forum/application/repositories/answer-repository'
import { Answer } from '@/domain/forum/enterprise/entities/answer'

export class InMemoryAnswersRepository implements AnswerRepository {
  public items: Answer[] = []

  // attachement repository
  constructor(
    private answerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

  async create(answer: Answer) {
    this.items.push(answer)

    // save questions attachments on repository
    await this.answerAttachmentsRepository.createMany(
      answer.attachments.getItems(),
    )

    // calling DB to create dispatch for domain events
    DomainEvents.dispatchEventsForAggregate(answer.id)
  }

  async delete(answer: Answer) {
    const itemIndex = this.items.findIndex((item) => item.id === answer.id)

    // splice remove an item from array
    this.items.splice(itemIndex, 1)

    // delete all attachments
    this.answerAttachmentsRepository.deleteManyByAnswerId(answer.id.toString())
  }

  async save(answer: Answer) {
    const itemIndex = this.items.findIndex((item) => item.id === answer.id)

    // replace an item from another answer
    this.items[itemIndex] = answer

    // save only new attachments
    await this.answerAttachmentsRepository.createMany(
      answer.attachments.getNewItems(),
    )

    // save new attachments and delete witth watched list
    await this.answerAttachmentsRepository.deleteMany(
      answer.attachments.getRemovedItems(),
    )

    DomainEvents.dispatchEventsForAggregate(answer.id)
  }

  async findById(id: string) {
    const answer = this.items.find((item) => item.id.toString() === id)

    if (!answer) {
      return null
    }

    return answer
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
    const answers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice((page - 1) * 20, page * 20)

    return answers
  }
}
