import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/opcional'
import { Comment, CommentProps } from './comment'
import { AnswerCommentEvent } from '../events/answer-comment-event'

export interface AnswerCommentProps extends CommentProps {
  answerId: UniqueEntityID
}

// inherits from base comment all the props abstract class
export class AnswerComment extends Comment<AnswerCommentProps> {
  get answerId() {
    return this.props.answerId
  }

  // instancy properties by static create function
  static create(
    props: Optional<AnswerCommentProps, 'createdAt'>, // createdAt is optional
    id?: UniqueEntityID,
  ) {
    const answerComment = new AnswerComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    // if don't exist an id, create a domain event
    const isNewAnswerComment = !id

    if (isNewAnswerComment) {
      answerComment.addDomainEvents(new AnswerCommentEvent(answerComment))
    }

    return answerComment
  }
}
