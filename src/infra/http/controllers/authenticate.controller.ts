import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { WrongCredentialsError } from '@/domain/forum/application/use-cases/errors/wrong-credentials-error'
import { Public } from '@/infra/auth/public'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// type the variables created in the zod object
type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
@Public() // public route
export class AuthenticateController {
  constructor(private authenticateStudent: AuthenticateStudentUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema)) // zod's pipe
  async handle(@Body() body: AuthenticateBodySchema) {
    // parse(body) validates the body schema
    const { email, password } = body

    const result = await this.authenticateStudent.execute({
      email,
      password,
    })

    // verify if there's error inside from the use case
    if (result.isLeft()) {
      const error = result.value

      // use the nest error to build the error message
      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message) // 401
        default:
          throw new BadRequestException(error.message) // 400
      }
    }

    const { accessToken } = result.value

    return {
      access_token: accessToken,
    }
  }
}
