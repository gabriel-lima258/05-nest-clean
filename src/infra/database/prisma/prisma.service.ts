import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'], // show debug on terminal
    })
  }

  // module to init the prisma when restart
  onModuleInit() {
    return this.$connect()
  }

  // module to destroy the prisma when crashed
  onModuleDestroy() {
    return this.$disconnect()
  }
}
