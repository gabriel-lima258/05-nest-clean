import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { StudentFactory } from 'test/factories/make-student'

describe('Upload attachments (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let jwt: JwtService

  beforeAll(async () => {
    // module to start server without the official server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory], // get factory instance
    }).compile()

    app = moduleRef.createNestApplication()

    // get prisma and jwt from inside the module
    studentFactory = moduleRef.get(StudentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /attachments', async () => {
    // create user
    const user = await studentFactory.makePrismaStudent()

    // get its token / toString because is from domain pattern
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post(`/attachments`)
      .set('Authorization', `Bearer ${accessToken}`) // set authorization
      .attach('file', './test/e2e/leticia.png') // set file tmp folder

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      attachmentId: expect.any(String),
    })
  })
})
