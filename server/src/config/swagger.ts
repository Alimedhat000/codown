import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//eslint-disable-next-line
export const setupSwagger = (app: any) => {
  // Only serve Swagger in development and staging
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

    // Update server URLs based on environment
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:${process.env.PORT || 3000}/api`
        : process.env.API_BASE_URL || 'https://api.example.com';

    swaggerDocument.servers = [
      {
        url: baseUrl,
        description: `${process.env.NODE_ENV} server`,
      },
    ];

    const options = {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px; }
      `,
      customSiteTitle: 'Document Collaboration API Documentation',
    };

    app.use('/api/docs', swaggerUi.serve);
    app.get('/api/docs', swaggerUi.setup(swaggerDocument, options));

    console.log(`📚 Swagger documentation available at: ${baseUrl.replace('/api', '')}/api/docs`);
  } catch (error) {
    console.error('Failed to setup Swagger documentation:', error);
  }
};
