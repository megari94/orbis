"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('El email ya está registrado');
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
                role: client_1.UserRole.ADMIN,
            },
        });
        return this.buildToken(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        return this.buildToken(user);
    }
    async me(userId) {
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
    async updateProfile(userId, dto) {
        if (dto.email) {
            const taken = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id: userId } },
            });
            if (taken)
                throw new common_1.ConflictException('Ese email ya está en uso');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: { id: true, email: true, name: true, role: true, tenantId: true, avatarUrl: true },
        });
        return updated;
    }
    async updateAvatar(userId, filename) {
        const avatarUrl = `/uploads/avatars/${filename}`;
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { id: true, email: true, name: true, role: true, tenantId: true, avatarUrl: true },
        });
        return updated;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid)
            throw new common_1.BadRequestException('La contraseña actual es incorrecta');
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
    async deleteAccount(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.BadRequestException('Contraseña incorrecta');
        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Cuenta eliminada' };
    }
    buildToken(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map