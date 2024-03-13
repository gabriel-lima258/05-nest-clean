import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Notification } from '../../enterprise/entities/notification'
import { NotificationRepository } from '../repositories/notification-repository'
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'

export interface SendNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
}

export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

@Injectable()
export class SendNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute({
    recipientId,
    title,
    content,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityID(recipientId),
      title,
      content,
    })

    // save the notification in the notification repository
    await this.notificationRepository.create(notification)

    return right({
      notification,
    })
  }
}
