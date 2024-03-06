import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'
import { EnvService } from '../env/env.service'

// information about token
const tokenPayload = z.object({
  sub: z.string().uuid(),
})

export type UserPayload = z.infer<typeof tokenPayload>

// valid if user if logged in and use public key
@Injectable() // every class must be injectable if it's providers
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  // return token's validation
  async validate(payload: UserPayload) {
    return tokenPayload.parse(payload)
  }
}
