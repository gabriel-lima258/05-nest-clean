import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

// pipe validation zod
const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

// type the variables created in the zod object
type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  @HttpCode(201) // status code
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content, attachments } = body
    const { sub: userId } = user

    const result = await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: attachments,
    })

    // if result does't exist
    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
