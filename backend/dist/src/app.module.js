"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const conversations_module_1 = require("./conversations/conversations.module");
const messages_module_1 = require("./messages/messages.module");
const contacts_module_1 = require("./contacts/contacts.module");
const channel_config_module_1 = require("./channel-config/channel-config.module");
const n8n_module_1 = require("./n8n/n8n.module");
const ai_bot_module_1 = require("./ai-bot/ai-bot.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            contacts_module_1.ContactsModule,
            channel_config_module_1.ChannelConfigModule,
            n8n_module_1.N8nModule,
            ai_bot_module_1.AiBotModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map