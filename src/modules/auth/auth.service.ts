import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { LoginInput, RegisterInput } from './auth.schema.js';
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
export async function registerService(data: RegisterInput) {
  // 1. Verifica se o e-mail já existe
  const userExists = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (userExists) {
    throw new AppError('E-mail já está em uso.', 409, 'FLX_EMAIL_IN_USE');
  }

  // 2. Criptografa a senha
  const passwordHash = await bcrypt.hash(data.password, 10);

  // 3. Cria o usuário no banco
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      teamId: data.teamId,
    },
  });

  // 4. Remove a senha antes de retornar
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}