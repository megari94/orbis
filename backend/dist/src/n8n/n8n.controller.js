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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const n8n_service_1 = require("./n8n.service");
let N8nController = class N8nController {
    constructor(n8n) {
        this.n8n = n8n;
    }
    getConfig(tenantId) {
        return this.n8n.getConfig(tenantId);
    }
    saveConfig(tenantId, body) {
        return this.n8n.saveConfig(tenantId, body.webhookUrl, body.secret);
    }
    async receiveFromN8n(secret, dto) {
        const valid = await this.n8n.validateSecret(dto.tenantId, secret ?? '');
        if (!valid)
            throw new common_1.UnauthorizedException('Secret inválido');
        return this.n8n.saveBotMessage(dto.tenantId, dto.conversationId, dto.content, dto.isInternal ?? false);
    }
    simulateContactMessage(tenantId, conversationId, body) {
        return this.n8n.createContactMessage(tenantId, conversationId, body.content);
    }
};
exports.N8nController = N8nController;
__decorate([
    (0, common_1.Get)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, get_user_decorator_1.GetUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], N8nController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, get_user_decorator_1.GetUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], N8nController.prototype, "saveConfig", null);
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Headers)('x-orbis-secret')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], N8nController.prototype, "receiveFromN8n", null);
__decorate([
    (0, common_1.Post)('simulate/:conversationId'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], N8nController.prototype, "simulateContactMessage", null);
exports.N8nController = N8nController = __decorate([
    (0, swagger_1.ApiTags)('n8n'),
    (0, common_1.Controller)('n8n'),
    __metadata("design:paramtypes", [n8n_service_1.N8nService])
], N8nController);
//# sourceMappingURL=n8n.controller.js.map