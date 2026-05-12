import { PrismaClient, Channel, Status, Priority, SenderType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-orbis-demo' },
    update: {},
    create: { id: 'tenant-orbis-demo', name: 'Demo Store' },
  });

  const contacts = [
    { id: 'c1', name: 'Valentina Acosta',  email: 'v.acosta@gmail.com',   phone: '+54 9 11 5832-7291', location: 'CABA, Argentina' },
    { id: 'c2', name: 'Lucas Moreno',      email: 'lmoreno@gmail.com',    phone: '+54 9 351 4421-882', location: 'Córdoba, Argentina' },
    { id: 'c3', name: 'Sofía Ramírez',     email: 'sofiar@outlook.com',   phone: '+54 9 11 6743-1190', location: 'GBA Norte, Argentina' },
    { id: 'c4', name: 'Mateo González',    email: 'mateo.g@gmail.com',    phone: '+54 9 11 2234-5567', location: 'CABA, Argentina' },
    { id: 'c5', name: 'Paula Nieto',       email: 'pnieto@gmail.com',     phone: '+54 9 341 5512-334', location: 'Rosario, Argentina' },
    { id: 'c6', name: 'Juan Cabrera',      email: 'jcabrera@hotmail.com', phone: '+54 9 11 7789-2210', location: 'CABA, Argentina' },
    { id: 'c7', name: 'Camila Reyes',      email: 'camireyess@gmail.com', phone: '+54 9 11 3345-9921', location: 'La Plata, Argentina' },
  ];

  for (const c of contacts) {
    await prisma.contact.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, tenantId: tenant.id },
    });
  }

  // Channels por contacto
  await prisma.contactChannel.createMany({
    skipDuplicates: true,
    data: [
      { contactId: 'c1', channel: Channel.WHATSAPP,  externalId: '+5491158327291' },
      { contactId: 'c1', channel: Channel.INSTAGRAM, externalId: '@vale.acosta' },
      { contactId: 'c2', channel: Channel.INSTAGRAM, externalId: '@lucasmoreno' },
      { contactId: 'c3', channel: Channel.MESSENGER, externalId: 'fb_sofiaramirez' },
      { contactId: 'c4', channel: Channel.WHATSAPP,  externalId: '+5491122345567' },
      { contactId: 'c5', channel: Channel.INSTAGRAM, externalId: '@paulanieto' },
      { contactId: 'c6', channel: Channel.MESSENGER, externalId: 'fb_juancabrera' },
      { contactId: 'c7', channel: Channel.WHATSAPP,  externalId: '+5491133459921' },
    ],
  });

  // Conversaciones
  const convs = [
    { id: 'conv1', contactId: 'c1', channel: Channel.WHATSAPP,  status: Status.NEW,      priority: Priority.HIGH,   tags: ['precio','mayorista'], lastMessage: '¿Me hacés un descuento si llevo 3?',           unreadCount: 2 },
    { id: 'conv2', contactId: 'c2', channel: Channel.INSTAGRAM, status: Status.OPEN,     priority: Priority.NORMAL, tags: ['envio'],              lastMessage: 'Cuánto sale el envío a Córdoba?',              unreadCount: 0 },
    { id: 'conv3', contactId: 'c3', channel: Channel.MESSENGER, status: Status.RESOLVED, priority: Priority.NORMAL, tags: [],                     lastMessage: 'Ok perfecto, muchas gracias!',                 unreadCount: 0 },
    { id: 'conv4', contactId: 'c4', channel: Channel.WHATSAPP,  status: Status.NEW,      priority: Priority.HIGH,   tags: [],                     lastMessage: 'Necesito hablar con alguien urgente',          unreadCount: 1 },
    { id: 'conv5', contactId: 'c5', channel: Channel.INSTAGRAM, status: Status.RESOLVED, priority: Priority.NORMAL, tags: [],                     lastMessage: 'Ok perfecto, muchas gracias!',                 unreadCount: 0 },
    { id: 'conv6', contactId: 'c6', channel: Channel.MESSENGER, status: Status.NEW,      priority: Priority.HIGH,   tags: ['reclamo'],            lastMessage: 'El producto llegó roto :(',                    unreadCount: 1 },
    { id: 'conv7', contactId: 'c7', channel: Channel.WHATSAPP,  status: Status.OPEN,     priority: Priority.NORMAL, tags: ['pago'],               lastMessage: 'Aceptan Mercado Pago en cuotas?',              unreadCount: 0 },
  ];

  for (const c of convs) {
    await prisma.conversation.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, tenantId: tenant.id },
    });
  }

  // Mensajes de conv1 (Valentina)
  await prisma.message.createMany({
    skipDuplicates: true,
    data: [
      { id: 'm1', conversationId: 'conv1', sender: SenderType.CONTACT, channel: Channel.WHATSAPP,  content: 'Hola! Vi que tenés remeras de algodón. Qué precio tienen?', isBot: false },
      { id: 'm2', conversationId: 'conv1', sender: SenderType.BOT,     channel: Channel.WHATSAPP,  content: '¡Hola Valentina! Las remeras de algodón están a $8.500 ARS (IVA incluido). Tenemos talles S al XL. ¿Querés que te mande el catálogo completo?', isBot: true },
      { id: 'm3', conversationId: 'conv1', sender: SenderType.CONTACT, channel: Channel.WHATSAPP,  content: '¿Me hacés un descuento si llevo 3?', isBot: false },
      { id: 'm4', conversationId: 'conv1', sender: SenderType.SYSTEM,  channel: Channel.WHATSAPP,  content: 'Bot derivó a humano — negociación de precios detectada', isBot: false, isInternal: true },
    ],
  });

  console.log('✅ Seed completado — tenant:', tenant.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());