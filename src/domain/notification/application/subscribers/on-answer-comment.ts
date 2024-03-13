import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { AnswerCommentEvent } from '@/domain/forum/enterprise/events/answer-comment-event'
import { AnswerRepository } from '@/domain/forum/application/repositories/answer-repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnAnswerComment implements EventHandler {
  // use question repository to link to answer
  constructor(
    private answerRepository: AnswerRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      // bind(this) is used to reference OnAnswerCreated
      this.sendNewAnswerNotification.bind(this),
      AnswerCommentEvent.name,
    )
  }

  private async sendNewAnswerNotification({
    answerComment,
  }: AnswerCommentEvent) {
    const answer = await this.answerRepository.findById(
      answerComment.answerId.toString(),
    )

    if (answer) {
      await this.sendNotification.execute({
        recipientId: answer.authorId.toString(),
        title: `Novo comentario em sua resposta`,
        content: answerComment.content.substring(0, 40).concat('...'),
      })
    }
  }
}
