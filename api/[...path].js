import app from '../backend/src/app.js';

export default async function handler(req, res) {
  await new Promise((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    app(req, res);
  });
}
