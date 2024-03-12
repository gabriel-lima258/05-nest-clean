import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaAttachmentMapper } from '@/infra/database/prisma/mappers/prisma-attachment-mapper'
import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/enterprise/entities/attachment'

// factory domain for unit tests
// partial transform any props opcional
export function makeAttachment(
  override: Partial<AttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const attachment = Attachment.create(
    {
      title: faker.lorem.slug(),
      url: faker.internet.url(),
      ...override,
    },
    id, // if exist an id get it
  )

  return attachment
}

// factory for e2e tests
@Injectable()
export class AttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAttachment(
    data: Partial<AttachmentProps> = {},
  ): Promise<Attachment> {
    // get data from domain
    const attachment = makeAttachment(data)

    // setting DB to entity
    await this.prisma.attachment.create({
      data: PrismaAttachmentMapper.toPrisma(attachment),
    })

    return attachment
  }
}
