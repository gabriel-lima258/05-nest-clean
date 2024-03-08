import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question'

const commentOnQuestionBodySchema = z.object({
  content: z.string(),
})

// pipe validation zod
const bodyValidationPipe = new ZodValidationPipe(commentOnQuestionBodySchema)

// type the variables created in the zod object
type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private commentOnQuestion: CommentOnQuestionUseCase) {}

  @Post()
  @HttpCode(201) // status code
  async handle(
    @Param('questionId') questionId: string,
    @Body(bodyValidationPipe) body: CommentOnQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const { sub: userId } = user

    const result = await this.commentOnQuestion.execute({
      content,
      authorId: userId,
      questionId,
    })

    // if result does't exist
    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
