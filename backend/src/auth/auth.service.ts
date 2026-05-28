import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('El email ya está registrado');

    const tenant = await this.prisma.tenant.create({
      data: { name: dto.tenantName },
    });

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        tenantId: tenant.id,
        role: UserRole.ADMIN,
      },
    });

    return this.buildToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildToken(user);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        avatarUrl: true,
        createdAt: true,
        tenant: { select: { name: true } },
      },
    });
  }

  // ── Actualizar perfil ──────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Si cambia el email, verificar que no esté en uso
    if (dto.email) {
      const taken = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (taken) throw new ConflictException('Ese email ya está en uso');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, name: true, role: true, tenantId: true, avatarUrl: true },
    });

    return updated;
  }

  // ── Actualizar avatar ──────────────────────────────────────────────────────

  async updateAvatar(userId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, email: true, name: true, role: true, tenantId: true, avatarUrl: true },
    });
    return updated;
  }

  // ── Cambiar contraseña ─────────────────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('La contraseña actual es incorrecta');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ── Eliminar cuenta ────────────────────────────────────────────────────────

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new BadRequestException('Contraseña incorrecta');

    // Eliminar usuario (el tenant y sus datos se eliminan en cascada)
    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Cuenta eliminada' };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private buildToken(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    avatarUrl?: string | null;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl ?? null,
      },
    };
  }
}
