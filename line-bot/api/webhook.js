// pages/api/line.js
export default function handler(req, res) {
  // ← ここがハンドラーの先頭
  console.log('Channel Secret:', process.env.CHANNEL_SECRET ? 'OK' : 'MISSING');
  console.log('Access Token:', process.env.CHANNEL_ACCESS_TOKEN ? 'OK' : 'MISSING');

  // 署名検証やメッセージ処理はここから書く
  // 署名検証などのコードが入る前にログを出すことで
  // 環境変数が正しく取れているか確認できる

  res.status(200).send('OK'); // とりあえず 200 を返すだけ
}
const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// JSON body のパース
app.use(express.json());

app.post('/api/webhook', (req, res) => {
  const events = req.body.events;
  if (!events) {
    return res.status(200).send('No events');
  }

  Promise.all(events.map(handleEvent))
    .then((result) => res.status(200).json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const text = event.message.text.toLowerCase();

  let replyText = 'こんにちは！カテゴリーを選んでください。\n1. ヘアケア\n2. スキンケア\n3. 美容家電';

  if (text.includes('ヘアケア')) {
    replyText = '髪質を教えてください: 太い / 細い / 普通';
  } else if (text.includes('スキンケア')) {
    replyText = 'お肌の悩みを教えてください';
  } else if (text.includes('美容家電')) {
    replyText = 'お悩みを教えてください';
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

module.exports = app;
