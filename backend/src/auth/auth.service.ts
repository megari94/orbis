import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
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

  // ── Recuperar contraseña ───────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Siempre respondemos OK para no revelar si el email existe
    if (!user) return { message: 'Si el email existe, recibirás un link de recuperación' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const appUrl = this.config.get('FRONTEND_URL') || process.env.BACKEND_URL || 'http://localhost:5173';
    const resetLink = `${appUrl}?resetToken=${token}`;

    await this.sendResetEmail(email, user.name, resetLink);

    return { message: 'Si el email existe, recibirás un link de recuperación' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('El link expiró o es inválido');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  private async sendResetEmail(to: string, name: string, resetLink: string) {
    const smtpHost = this.config.get('SMTP_HOST');
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');
    const smtpPort = Number(this.config.get('SMTP_PORT') || 587);
    const smtpFrom = this.config.get('SMTP_FROM') || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Sin SMTP configurado, solo loguear el link (útil en desarrollo)
      console.warn(`[RESET LINK para ${to}]: ${resetLink}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"ORBIS" <${smtpFrom}>`,
      to,
      subject: 'Recuperá tu contraseña de ORBIS',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; border-radius: 12px; color: #e0e0e0;">
          <h2 style="color: #fff; margin-top: 0;">Hola, ${name} 👋</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ORBIS.</p>
          <p>Hacé click en el botón para elegir una nueva contraseña. El link expira en <strong>1 hora</strong>.</p>
          <a href="${resetLink}" style="display:inline-block; margin: 24px 0; padding: 14px 28px; background: #e53e3e; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Restablecer contraseña
          </a>
          <p style="color: #888; font-size: 13px;">Si no solicitaste esto, podés ignorar este email. Tu contraseña no cambia.</p>
          <p style="color: #888; font-size: 13px;">O copiá este link: <a href="${resetLink}" style="color:#aaa;">${resetLink}</a></p>
        </div>
      `,
    });
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
