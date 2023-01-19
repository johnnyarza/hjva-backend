import https from 'https';
import fs from 'fs';
import app from './app';

const privateKey = fs.readFileSync('./ssl/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.listen(3333, () => {
  console.log('Running at 3333');
});

https.createServer(credentials, app).listen(3334, () => {
  console.log('https at 3334');
});
