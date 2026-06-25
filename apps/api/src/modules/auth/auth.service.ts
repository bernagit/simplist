import { jwtService } from '../../infrastructure/auth/jwt'
import { createModuleLogger } from '../../infrastructure/logging/logger'
import { Errors } from '../../types/http'
import { UserRepository } from '../user/user.repository'
import { LoginInput, RegisterInput } from './auth.schema'
import bcrypt from 'bcrypt'

export class AuthService {
  private readonly logger = createModuleLogger('AuthService')
  private userRepository: UserRepository = new UserRepository()
  constructor() {}

  public async register(data: RegisterInput) {
    // check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw Errors.conflict('User with this email already exists')
    }

    // hash password
    const passwordHash = await this.hashPassword(data.password)

    // create user
    const user = await this.userRepository.createUser({
      name: data.name || data.email,
      email: data.email,
      passwordHash
    })

    if (!user) {
      throw Errors.internal('Failed to create user')
    }

    return user
  }

  public async login(data: LoginInput) {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw Errors.unauthorized('Invalid email or password')
    }
    const isMatch = await bcrypt.compare(data.password, user.passwordHash)

    if (!isMatch) {
      throw Errors.unauthorized('Invalid email or password')
    }

    // create and return tokens
    const tokens = {
      accessToken: jwtService.signToken({ userId: user.id })
    }

    return tokens
  }

  private async hashPassword(password: string) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }
}
