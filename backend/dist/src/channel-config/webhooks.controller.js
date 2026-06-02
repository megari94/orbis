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
var WebhooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const channel_config_service_1 = require("./channel-config.service");
const n8n_service_1 = require("../n8n/n8n.service");
let WebhooksController = WebhooksController_1 = class WebhooksController {
    constructor(channelConfig, n8nService) {
        this.channelConfig = channelConfig;
        this.n8nService = n8nService;
        this.logger = new common_1.Logger(WebhooksController_1.name);
    }
    async verify(channel, mode, verifyToken, challenge, res) {
        this.logger.log(`Webhook verify: channel=${channel} mode=${mode} token=${verifyToken}`);
        if (mode === 'subscribe' && verifyToken && challenge) {
            const config = await this.channelConfig.findByVerifyToken(channel.toUpperCase(), verifyToken);
            if (config) {
                this.logger.log(`Webhook verificado para tenant ${config.tenantId}`);
                return res.status(200).send(challenge);
            }
        }
        this.logger.warn(`Webhook rechazado: token no válido o modo incorrecto`);
        return res.status(403).send('Forbidden');
    }
    async receiveWhatsapp(body, res) {
        res.sendStatus(200);
        try {
            const entry = body?.entry?.[0];
            const change = entry?.changes?.[0]?.value;
            const messages = change?.messages;
            if (!messages?.length)
                return;
            const msg = messages[0];
            const phoneNumberId = change.metadata?.phone_number_id;
            const from = msg.from;
            const text = msg.text?.body || msg.type;
            if (!phoneNumberId || !text)
                return;
            const config = await this.channelConfig.findByPhoneNumberId(phoneNumberId);
            if (!config) {
                this.logger.warn(`No se encontró tenant para phoneNumberId: ${phoneNumberId}`);
                return;
            }
            this.logger.log(`Mensaje de WhatsApp: de=${from} tenant=${config.tenantId}`);
            await this.n8nService.createIncomingMessage(config.tenantId, 'WHATSAPP', from, `+${from}`, text);
        }
        catch (err) {
            this.logger.error('Error procesando webhook WhatsApp', err);
        }
    }
    async receiveInstagram(body, res) {
        res.sendStatus(200);
        try {
            const entry = body?.entry?.[0];
            const messaging = entry?.messaging?.[0];
            if (!messaging)
                return;
            const pageId = entry?.id;
            const from = messaging.sender?.id;
            const text = messaging.message?.text;
            if (!pageId || !from || !text)
                return;
            const config = await this.channelConfig.findByPageId(pageId);
            if (!config)
                return;
            await this.n8nService.createIncomingMessage(config.tenantId, 'INSTAGRAM', from, from, text);
        }
        catch (err) {
            this.logger.error('Error procesando webhook Instagram', err);
        }
    }
    async receiveMessenger(body, res) {
        res.sendStatus(200);
        try {
            const entry = body?.entry?.[0];
            const messaging = entry?.messaging?.[0];
            if (!messaging)
                return;
            const pageId = entry?.id;
            const from = messaging.sender?.id;
            const text = messaging.message?.text;
            if (!pageId || !from || !text)
                return;
            const config = await this.channelConfig.findByPageId(pageId);
            if (!config)
                return;
            await this.n8nService.createIncomingMessage(config.tenantId, 'MESSENGER', from, from, text);
        }
        catch (err) {
            this.logger.error('Error procesando webhook Messenger', err);
        }
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Get)(':channel'),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Query)('hub.mode')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __param(3, (0, common_1.Query)('hub.challenge')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('whatsapp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "receiveWhatsapp", null);
__decorate([
    (0, common_1.Post)('instagram'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "receiveInstagram", null);
__decorate([
    (0, common_1.Post)('messenger'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "receiveMessenger", null);
exports.WebhooksController = WebhooksController = WebhooksController_1 = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [channel_config_service_1.ChannelConfigService,
        n8n_service_1.N8nService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map