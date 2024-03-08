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
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer'

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
})

// pipe validation zod
const bodyValidationPipe = new ZodValidationPipe(commentOnAnswerBodySchema)

// type the variables created in the zod object
type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>

@Controller('/answers/:answerId/comments')
export class CommentOnAnswerController {
  constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  @HttpCode(201) // status code
  async handle(
    @Param('answerId') answerId: string,
    @Body(bodyValidationPipe) body: CommentOnAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const { sub: userId } = user

    const result = await this.commentOnAnswer.execute({
      content,
      authorId: userId,
      answerId,
    })

    // if result does't exist
    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
