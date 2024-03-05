import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/opcional'
import { AnswerAttachmentList } from './answer-attachment-list'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { AnswerCreatedEvent } from '../events/answer-created-event'

export interface AnswerProps {
  authorId: UniqueEntityID
  questionId: UniqueEntityID
  content: string
  attachments: AnswerAttachmentList
  createdAt: Date
  updatedAt?: Date
}

// Entity<AnswerProps> is a form to get the props above
export class Answer extends AggregateRoot<AnswerProps> {
  // now props can be access
  get content() {
    return this.props.content
  }

  get authorId() {
    return this.props.authorId
  }

  get questionId() {
    return this.props.questionId
  }

  get attachments() {
    return this.props.attachments
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  // summary of content
  get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...')
  }

  // touch is a function that update a date
  private touch() {
    this.props.updatedAt = new Date()
  }

  set content(content: string) {
    this.props.content = content
    this.touch() // use when update a new content
  }

  set attachments(attachment: AnswerAttachmentList) {
    this.props.attachments = attachment
    this.touch() // use when update
  }

  // instancy properties by static create function
  static create(
    props: Optional<AnswerProps, 'createdAt' | 'attachments'>, // createdAt is optional
    id?: UniqueEntityID,
  ) {
    const answer = new Answer(
      {
        ...props,
        attachments: props.attachments ?? new AnswerAttachmentList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    // if don't exist an id, create a domain event
    const isNewAnswer = !id

    if (isNewAnswer) {
      answer.addDomainEvents(new AnswerCreatedEvent(answer))
    }

    return answer
  }
}
