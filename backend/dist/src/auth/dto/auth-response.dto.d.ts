export declare class AuthUserDto {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: AuthUserDto;
}
