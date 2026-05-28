"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenant = await prisma.tenant.upsert({
        where: { id: 'tenant-orbis-demo' },
        update: {},
        create: { id: 'tenant-orbis-demo', name: 'Demo Store' },
    });
    const contacts = [
        { id: 'c1', name: 'Valentina Acosta', email: 'v.acosta@gmail.com', phone: '+54 9 11 5832-7291', location: 'CABA, Argentina' },
        { id: 'c2', name: 'Lucas Moreno', email: 'lmoreno@gmail.com', phone: '+54 9 351 4421-882', location: 'Córdoba, Argentina' },
        { id: 'c3', name: 'Sofía Ramírez', email: 'sofiar@outlook.com', phone: '+54 9 11 6743-1190', location: 'GBA Norte, Argentina' },
        { id: 'c4', name: 'Mateo González', email: 'mateo.g@gmail.com', phone: '+54 9 11 2234-5567', location: 'CABA, Argentina' },
        { id: 'c5', name: 'Paula Nieto', email: 'pnieto@gmail.com', phone: '+54 9 341 5512-334', location: 'Rosario, Argentina' },
        { id: 'c6', name: 'Juan Cabrera', email: 'jcabrera@hotmail.com', phone: '+54 9 11 7789-2210', location: 'CABA, Argentina' },
        { id: 'c7', name: 'Camila Reyes', email: 'camireyess@gmail.com', phone: '+54 9 11 3345-9921', location: 'La Plata, Argentina' },
    ];
    for (const c of contacts) {
        await prisma.contact.upsert({
            where: { id: c.id },
            update: {},
            create: { ...c, tenantId: tenant.id },
        });
    }
    await prisma.contactChannel.createMany({
        skipDuplicates: true,
        data: [
            { contactId: 'c1', channel: client_1.Channel.WHATSAPP, externalId: '+5491158327291' },
            { contactId: 'c1', channel: client_1.Channel.INSTAGRAM, externalId: '@vale.acosta' },
            { contactId: 'c2', channel: client_1.Channel.INSTAGRAM, externalId: '@lucasmoreno' },
            { contactId: 'c3', channel: client_1.Channel.MESSENGER, externalId: 'fb_sofiaramirez' },
            { contactId: 'c4', channel: client_1.Channel.WHATSAPP, externalId: '+5491122345567' },
            { contactId: 'c5', channel: client_1.Channel.INSTAGRAM, externalId: '@paulanieto' },
            { contactId: 'c6', channel: client_1.Channel.MESSENGER, externalId: 'fb_juancabrera' },
            { contactId: 'c7', channel: client_1.Channel.WHATSAPP, externalId: '+5491133459921' },
        ],
    });
    const convs = [
        { id: 'conv1', contactId: 'c1', channel: client_1.Channel.WHATSAPP, status: client_1.Status.NEW, priority: client_1.Priority.HIGH, tags: ['precio', 'mayorista'], lastMessage: '¿Me hacés un descuento si llevo 3?', unreadCount: 2 },
        { id: 'conv2', contactId: 'c2', channel: client_1.Channel.INSTAGRAM, status: client_1.Status.OPEN, priority: client_1.Priority.NORMAL, tags: ['envio'], lastMessage: 'Cuánto sale el envío a Córdoba?', unreadCount: 0 },
        { id: 'conv3', contactId: 'c3', channel: client_1.Channel.MESSENGER, status: client_1.Status.RESOLVED, priority: client_1.Priority.NORMAL, tags: [], lastMessage: 'Ok perfecto, muchas gracias!', unreadCount: 0 },
        { id: 'conv4', contactId: 'c4', channel: client_1.Channel.WHATSAPP, status: client_1.Status.NEW, priority: client_1.Priority.HIGH, tags: [], lastMessage: 'Necesito hablar con alguien urgente', unreadCount: 1 },
        { id: 'conv5', contactId: 'c5', channel: client_1.Channel.INSTAGRAM, status: client_1.Status.RESOLVED, priority: client_1.Priority.NORMAL, tags: [], lastMessage: 'Ok perfecto, muchas gracias!', unreadCount: 0 },
        { id: 'conv6', contactId: 'c6', channel: client_1.Channel.MESSENGER, status: client_1.Status.NEW, priority: client_1.Priority.HIGH, tags: ['reclamo'], lastMessage: 'El producto llegó roto :(', unreadCount: 1 },
        { id: 'conv7', contactId: 'c7', channel: client_1.Channel.WHATSAPP, status: client_1.Status.OPEN, priority: client_1.Priority.NORMAL, tags: ['pago'], lastMessage: 'Aceptan Mercado Pago en cuotas?', unreadCount: 0 },
    ];
    for (const c of convs) {
        await prisma.conversation.upsert({
            where: { id: c.id },
            update: {},
            create: { ...c, tenantId: tenant.id },
        });
    }
    await prisma.message.createMany({
        skipDuplicates: true,
        data: [
            { id: 'm1', conversationId: 'conv1', sender: client_1.SenderType.CONTACT, channel: client_1.Channel.WHATSAPP, content: 'Hola! Vi que tenés remeras de algodón. Qué precio tienen?', isBot: false },
            { id: 'm2', conversationId: 'conv1', sender: client_1.SenderType.BOT, channel: client_1.Channel.WHATSAPP, content: '¡Hola Valentina! Las remeras de algodón están a $8.500 ARS (IVA incluido). Tenemos talles S al XL. ¿Querés que te mande el catálogo completo?', isBot: true },
            { id: 'm3', conversationId: 'conv1', sender: client_1.SenderType.CONTACT, channel: client_1.Channel.WHATSAPP, content: '¿Me hacés un descuento si llevo 3?', isBot: false },
            { id: 'm4', conversationId: 'conv1', sender: client_1.SenderType.SYSTEM, channel: client_1.Channel.WHATSAPP, content: 'Bot derivó a humano — negociación de precios detectada', isBot: false, isInternal: true },
        ],
    });
    const hashed = await bcrypt.hash('demo1234', 10);
    await prisma.user.upsert({
        where: { email: 'demo@orbis.com' },
        update: {},
        create: {
            email: 'demo@orbis.com',
            password: hashed,
            name: 'Admin Demo',
            tenantId: tenant.id,
            role: client_1.UserRole.ADMIN,
        },
    });
    console.log('✅ Seed completado — tenant:', tenant.id);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map