"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBotModule = void 0;
const common_1 = require("@nestjs/common");
const ai_bot_controller_1 = require("./ai-bot.controller");
const ai_bot_service_1 = require("./ai-bot.service");
const n8n_module_1 = require("../n8n/n8n.module");
let AiBotModule = class AiBotModule {
};
exports.AiBotModule = AiBotModule;
exports.AiBotModule = AiBotModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => n8n_module_1.N8nModule)],
        controllers: [ai_bot_controller_1.AiBotController],
        providers: [ai_bot_service_1.AiBotService],
        exports: [ai_bot_service_1.AiBotService],
    })
], AiBotModule);
//# sourceMappingURL=ai-bot.module.js.map