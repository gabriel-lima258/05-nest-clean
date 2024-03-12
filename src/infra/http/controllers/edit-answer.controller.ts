import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'

const editAnswerBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

// pipe validation zod
const bodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema)

// type the variables editd in the zod object
type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('/answers/:id')
export class EditAnswerController {
  constructor(private editAnswer: EditAnswerUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Param('id') answerId: string,
    @Body(bodyValidationPipe) body: EditAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, attachments } = body
    const { sub: userId } = user

    const result = await this.editAnswer.execute({
      content,
      answerId,
      authorId: userId,
      attachmentsIds: attachments,
    })

    // if result does't exist, generic error
    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
