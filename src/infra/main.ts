import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Env } from './env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // config env variables
  const configService: ConfigService<Env, true> = app.get(ConfigService)
  // get the PORT env
  const port = configService.get('PORT', { infer: true })

  await app.listen(port)
}
bootstrap()
