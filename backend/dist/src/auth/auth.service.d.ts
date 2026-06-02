import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            tenantId: string;
            avatarUrl: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            tenantId: string;
            avatarUrl: string;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        tenant: {
            name: string;
        };
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string;
    }>;
    updateAvatar(userId: string, filename: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    private sendResetEmail;
    deleteAccount(userId: string, dto: DeleteAccountDto): Promise<{
        message: string;
    }>;
    private buildToken;
}
