import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer'

@Controller('/answers/:answerId/best-answer')
export class ChooseQuestionBestAnswerController {
  constructor(
    private chooseQuestionBestAnswer: ChooseQuestionBestAnswerUseCase,
  ) {}

  @Patch() // update something specific
  @HttpCode(204)
  async handle(
    @Param('answerId') answerId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { sub: userId } = user

    const result = await this.chooseQuestionBestAnswer.execute({
      answerId,
      authorId: userId,
    })

    // if result does't exist
    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
