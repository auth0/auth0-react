const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');

dotenv.config();

const { DOMAIN, AUDIENCE, PORT = 3001 } = process.env;

const app = express();

if (!DOMAIN || !AUDIENCE) {
  throw new Error(
    'Please make sure that DOMAIN and AUDIENCE is set in your .env file'
  );
}

app.use(cors()); // Allow all cors (not recommended for production)

const checkJwt = auth({
  audience: AUDIENCE,
  issuerBaseURL: `https://${DOMAIN}`,
});

app.head('/', (req, res) => res.send('ok'));

app.get('/users', checkJwt, requiredScopes('read:users'), (req, res) => {
  res.send([
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Alice', email: 'alice@example.com' },
  ]);
});

app.listen(PORT, () => console.log(`API Server listening on port ${PORT}`));
