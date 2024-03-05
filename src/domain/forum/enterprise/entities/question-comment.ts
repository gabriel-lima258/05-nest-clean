import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/opcional'
import { Comment, CommentProps } from './comment'
import { QuestionCommentEvent } from '../events/question-comment-event'

export interface QuestionCommentProps extends CommentProps {
  questionId: UniqueEntityID
}

// inherits from base comment all the props abstract class
export class QuestionComment extends Comment<QuestionCommentProps> {
  get questionId() {
    return this.props.questionId
  }

  // instancy properties by static create function
  static create(
    props: Optional<QuestionCommentProps, 'createdAt'>, // createdAt is optional
    id?: UniqueEntityID,
  ) {
    const questionComment = new QuestionComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    // if don't exist an id, create a domain event
    const isNewQuestionComment = !id

    if (isNewQuestionComment) {
      questionComment.addDomainEvents(new QuestionCommentEvent(questionComment))
    }

    return questionComment
  }
}
