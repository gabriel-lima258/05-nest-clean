import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create account (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    // module to start server without the official server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    // get prisma from inside the module
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Gabriel',
      email: 'gabriel58221@gmail.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)

    // verify if the user created is on database
    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'gabriel58221@gmail.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
