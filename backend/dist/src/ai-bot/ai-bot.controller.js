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
exports.AiBotController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const ai_bot_service_1 = require("./ai-bot.service");
const bot_config_dto_1 = require("./dto/bot-config.dto");
let AiBotController = class AiBotController {
    constructor(svc) {
        this.svc = svc;
    }
    getConfig(tenantId) {
        return this.svc.getConfig(tenantId);
    }
    upsertConfig(tenantId, dto) {
        return this.svc.upsertConfig(tenantId, dto);
    }
    testConnection() {
        return this.svc.testConnection();
    }
    simulate(tenantId, body) {
        return this.svc.processMessage(tenantId, body.conversationId, body.content);
    }
};
exports.AiBotController = AiBotController;
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, get_user_decorator_1.GetUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiBotController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    __param(0, (0, get_user_decorator_1.GetUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bot_config_dto_1.UpsertBotConfigDto]),
    __metadata("design:returntype", void 0)
], AiBotController.prototype, "upsertConfig", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiBotController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('simulate'),
    __param(0, (0, get_user_decorator_1.GetUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiBotController.prototype, "simulate", null);
exports.AiBotController = AiBotController = __decorate([
    (0, swagger_1.ApiTags)('ai-bot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai-bot'),
    __metadata("design:paramtypes", [ai_bot_service_1.AiBotService])
], AiBotController);
//# sourceMappingURL=ai-bot.controller.js.map