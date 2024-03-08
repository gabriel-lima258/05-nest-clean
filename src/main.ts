import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './infra/env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // config env variables
  const envService = app.get(EnvService)
  // get the PORT env
  const port = envService.get('PORT')

  await app.listen(port)
}
bootstrap()
