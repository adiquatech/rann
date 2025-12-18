const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'rann API',
    description: 'Full CRUD API for managing data',
  },
  // host: 'localhost:3000',
  host: 'contact-api-2il0.onrender.com',
  schemes: ['https'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated!');
});
