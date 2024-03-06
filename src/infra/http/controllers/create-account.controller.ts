import { RegisterStudentUseCase } from '@/domain/forum/application/use-cases/register-student'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { StudentAlreadyExistsError } from '@/domain/forum/application/use-cases/errors/student-already-exists-error'
import { Public } from '@/infra/auth/public'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

// type the variables created in the zod object
type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
@Public() // public route
export class CreateAccountController {
  constructor(private registerStudent: RegisterStudentUseCase) {}

  @Post()
  @HttpCode(201) // status code
  @UsePipes(new ZodValidationPipe(createAccountBodySchema)) // zod's pipe
  async handle(@Body() body: CreateAccountBodySchema) {
    // parse(body) validates the body schema
    const { name, email, password } = body

    const result = await this.registerStudent.execute({
      name,
      email,
      password,
    })

    // verify if there's error inside from the use case
    if (result.isLeft()) {
      const error = result.value

      // use the nest error to build the error message
      switch (error.constructor) {
        case StudentAlreadyExistsError:
          throw new ConflictException(error.message) // 409
        default:
          throw new BadRequestException(error.message) // 400
      }
    }
  }
}
