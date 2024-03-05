import dayjs from 'dayjs'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/opcional'
import { Slug } from './value-objects/slug'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { QuestionAttachmentList } from './question-attachment-list'
import { QuestionBestAnswerChosenEvent } from '../events/question-best-answer-chosen-event'

export interface QuestionProps {
  authorId: UniqueEntityID // relation id for the author
  bestAnswerId?: UniqueEntityID | null // the best answer
  title: string
  slug: Slug
  content: string
  attachments: QuestionAttachmentList // watched list of attachments
  createdAt: Date
  updatedAt?: Date | null
}

// Entity<QuestionProps> is a form to get the props above
export class Question extends AggregateRoot<QuestionProps> {
  // now props can be access without change the base entity
  get authorId() {
    return this.props.authorId
  }

  get bestAnswerId() {
    return this.props.bestAnswerId
  }

  get title() {
    return this.props.title
  }

  get slug() {
    return this.props.slug
  }

  get content() {
    return this.props.content
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

  // get the diference of two dates
  get isNew(): boolean {
    return dayjs().diff(this.createdAt, 'days') <= 3
  }

  // summary of content
  get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...')
  }

  // touch is a function that update a date
  private touch() {
    this.props.updatedAt = new Date()
  }

  set title(title: string) {
    this.props.title = title
    this.props.slug = Slug.createFromText(title) // change slug
    this.touch() // use when update a new content
  }

  set content(content: string) {
    this.props.content = content
    this.touch() // use when update a new content
  }

  set attachments(attachemnts: QuestionAttachmentList) {
    this.props.attachments = attachemnts
    this.touch() // use when update a new content
  }

  set bestAnswerId(bestAnswerId: UniqueEntityID | undefined | null) {
    // if best answer id is diferent return event
    if (bestAnswerId && bestAnswerId !== this.props.bestAnswerId) {
      this.addDomainEvents(
        new QuestionBestAnswerChosenEvent(this, bestAnswerId),
      )
    }

    this.props.bestAnswerId = bestAnswerId

    this.touch() // use when update a new content
  }

  // instancy properties by static create function
  static create(
    props: Optional<QuestionProps, 'createdAt' | 'slug' | 'attachments'>, // createdAt is optional
    id?: UniqueEntityID,
  ) {
    const question = new Question(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        attachments: props.attachments ?? new QuestionAttachmentList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return question
  }
}
