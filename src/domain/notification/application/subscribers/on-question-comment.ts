import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { QuestionCommentEvent } from '@/domain/forum/enterprise/events/question-comment-event'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnQuestionComment implements EventHandler {
  // use question repository to link to answer
  constructor(
    private questionRepository: QuestionRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      // bind(this) is used to reference OnAnswerCreated
      this.sendNewAnswerNotification.bind(this),
      QuestionCommentEvent.name,
    )
  }

  private async sendNewAnswerNotification({
    questionComment,
  }: QuestionCommentEvent) {
    const question = await this.questionRepository.findById(
      questionComment.questionId.toString(),
    )

    if (question) {
      await this.sendNotification.execute({
        recipientId: question.authorId.toString(),
        title: `Novo comentario em sua pergunta`,
        content: questionComment.content.substring(0, 40).concat('...'),
      })
    }
  }
}
