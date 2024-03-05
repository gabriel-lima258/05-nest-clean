import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface CommentProps {
  authorId: UniqueEntityID
  content: string
  createdAt: Date
  updatedAt?: Date
}

// abstract always must be instance for another class
// Comment<Props extends CommentProps> insert a base props and can add other props
export abstract class Comment<
  Props extends CommentProps,
> extends AggregateRoot<Props> {
  // now props can be access
  get content() {
    return this.props.content
  }

  get authorId() {
    return this.props.authorId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  // touch is a function that update a date
  private touch() {
    this.props.updatedAt = new Date()
  }

  set content(content: string) {
    this.props.content = content
    this.touch() // use when update a new content
  }
}
