const express = require('express');
const cors = require('cors');
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const dotenv = require('dotenv');

dotenv.config();

const { DOMAIN, AUDIENCE, PORT = 3001 } = process.env;

const app = express();

if (!DOMAIN || !AUDIENCE) {
  throw new Error(
    'Please make sure that DOMAIN and AUDIENCE is set in your .env file'
  );
}

app.use(cors()); // Allow all cors (not recommended for production)

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${DOMAIN}/.well-known/jwks.json`,
  }),
  audience: AUDIENCE,
  issuer: `https://${DOMAIN}/`,
  algorithm: ['RS256'],
});

app.head('/', (req, res) => res.send('ok'));

app.get('/users', checkJwt, jwtAuthz(['read:users']), (req, res) => {
  res.send([
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Alice', email: 'alice@example.com' },
  ]);
});

app.listen(PORT, () => console.log(`API Server listening on port ${PORT}`));
