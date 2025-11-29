// =======================
// LINE BOT 設定
// =======================
const express = require("express");
const line = require("@line/bot-sdk");

const config = {
  channelAccessToken: "Jt09uQsVSzTGwl9d3vxKFEQgiZ8/19h6j9j2/6psfUPRSH5gijuLJpaqJ0QbVSKgXNq6QqLSFhkjQr65jcaykDy5xlD4DJEZmjv9HTcBSTcpSSgYKHft99vfMC9NJjgn9fD2Wf4nhy+Y4Txel28VhgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "0e9b9917cad23e173e8210f0892ee39f",
};

const client = new line.Client(config);
const app = express();
app.use(express.json());


// =======================
// 質問フロー定義
// =======================
const flows = {
  "ヘアケア": ["髪質を教えてください", "今の悩みは？", "どんな仕上がりが理想ですか？", "商品をおすすめします"],
  "スキンケア": ["肌の悩みを教えてください", "商品をおすすめします"],
  "美容家電": ["悩みを教えてください", "商品をおすすめします"]
};

// =======================
// セッション管理
// =======================
let userState = {};


// =======================
// カテゴリー選択の Flex Message
// =======================
const categoryFlexMessage = {
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      { "type": "text", "text": "カテゴリーを選んでください", "weight": "bold", "size": "lg" },
      {
        "type": "button",
        "style": "primary",
        "action": { "type": "message", "label": "ヘアケア", "text": "ヘアケア" }
      },
      {
        "type": "button",
        "style": "primary",
        "action": { "type": "message", "label": "スキンケア", "text": "スキンケア" }
      },
      {
        "type": "button",
        "style": "primary",
        "action": { "type": "message", "label": "美容家電", "text": "美容家電" }
      }
    ]
  }
};


// =======================
// おすすめ商品カード（テンプレ）
// ※あなたの商品URLに書き換えてOK
// =======================
function productCard(category, answers) {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        { "type": "text", "text": "あなたへのおすすめ", "weight": "bold", "size": "xl" },
        { "type": "text", "text": `カテゴリー: ${category}` },
        { "type": "text", "text": `回答: ${answers.join(", ")}` },
        {
          "type": "button",
          "style": "primary",
          "action": {
            "type": "uri",
            "label": "商品を見る",
            "uri": "https://example.com" // ←ここを商品URLに変更
          }
        }
      ]
    }
  };
}


// =======================
// Webhook 受信 → 会話処理本体
// =======================
app.post("/webhook", (req, res) => {
  const events = req.body.events;

  events.forEach(async (event) => {
    const userId = event.source.userId;
    const text = event.message?.text;

    // -------------------
    // 診断開始
    // -------------------
    if (text === "診断") {
      userState[userId] = { category: null, step: 0, answers: [] };

      return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: "カテゴリーを選択してください",
        contents: categoryFlexMessage
      });
    }

    // -------------------
    // カテゴリーが選ばれた
    // -------------------
    if (flows[text]) {
      userState[userId] = { category: text, step: 0, answers: [] };
      
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: flows[text][0]
      });
    }

    // -------------------
    // 質問フロー進行中
    // -------------------
    if (userState[userId] && userState[userId].category) {
      const state = userState[userId];
      const category = state.category;

      // 回答を保存
      state.answers.push(text);
      state.step++;

      const nextQuestion = flows[category][state.step];

      // ====================  
      // 最後（商品表示）
      // ====================
      if (!nextQuestion || nextQuestion === "商品をおすすめします") {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "おすすめ商品",
          contents: productCard(category, state.answers)
        });
      }

      // ====================  
      // 次の質問をプッシュ
      // ====================
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: nextQuestion
      });
    }
  });

  res.sendStatus(200); // ← これが超重要（LINEは200を要求）
});


// =======================
// ポート起動
// =======================
app.listen(3000, () => {
  console.log("LINE BOT running on port 3000");
});
