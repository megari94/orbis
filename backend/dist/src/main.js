"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const fs_1 = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads' });
    const clientPath = (0, path_1.join)(__dirname, '..', '..', 'client');
    if ((0, fs_1.existsSync)(clientPath)) {
        app.useStaticAssets(clientPath);
    }
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.RENDER_EXTERNAL_URL,
        /^https?:\/\/localhost(:\d+)?$/,
        /^https:\/\/.*\.onrender\.com$/,
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const allowed = allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin));
            if (allowed)
                callback(null, true);
            else
                callback(new Error(`CORS bloqueado para: ${origin}`));
        },
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ORBIS API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    if ((0, fs_1.existsSync)(clientPath)) {
        const expressApp = app.getHttpAdapter().getInstance();
        expressApp.get(/^(?!\/api|\/uploads).*$/, (_req, res) => {
            res.sendFile((0, path_1.join)(clientPath, 'index.html'));
        });
    }
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`ORBIS backend running on port ${port}`);
    console.log(`Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map