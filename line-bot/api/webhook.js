import { Client, middleware } from '@line/bot-sdk';

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
});

export default async function handler(req, res) {
  console.log("CHANNEL_ACCESS_TOKEN:", process.env.CHANNEL_ACCESS_TOKEN ? "OK" : "NOT SET");
  console.log("CHANNEL_SECRET:", process.env.CHANNEL_SECRET ? "OK" : "NOT SET");

  if (req.method === 'POST') {
    try {
      // LINE Webhook ミドルウェアの検証
      await middleware({
        channelSecret: process.env.CHANNEL_SECRET
      })(req, res, () => {});
      console.log("Webhook received:", req.body);
      res.status(200).send('OK');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error');
    }
  } else {
    res.status(200).send('GET OK');
  }
}
