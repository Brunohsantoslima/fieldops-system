import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { LoginInput } from './auth.schema.js';

export async function authenticateService({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('E-mail ou senha inválidos.', 400, 'FLX_INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('E-mail ou senha inválidos.', 400, 'FLX_INVALID_CREDENTIALS');
  }

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}