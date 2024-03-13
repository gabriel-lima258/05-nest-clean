import { OnAnswerComment } from '@/domain/notification/application/subscribers/on-answer-comment'
import { OnAnswerCreated } from '@/domain/notification/application/subscribers/on-answer-created'
import { OnQuestionBestAnswerChosen } from '@/domain/notification/application/subscribers/on-question-best-answer-chosen'
import { OnQuestionComment } from '@/domain/notification/application/subscribers/on-question-comment'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule], // import question, answer repository in subscribers
  providers: [
    OnAnswerCreated,
    OnQuestionBestAnswerChosen,
    OnAnswerComment,
    OnQuestionComment,
    SendNotificationUseCase,
  ],
})
export class EventsModule {}
