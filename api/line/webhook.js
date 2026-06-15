const crypto = require('crypto');

const LINE_REPLY_API_URL = 'https://api.line.me/v2/bot/message/reply';

function bodyToBuffer(body) {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === 'string') return Buffer.from(body);
  if (body && typeof body === 'object') return Buffer.from(JSON.stringify(body));
  return Buffer.alloc(0);
}

function readRawBody(req) {
  if (req.readableEnded || req.complete) {
    return Promise.resolve(bodyToBuffer(req.body));
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', chunk => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on('end', () => {
      if (chunks.length > 0) {
        resolve(Buffer.concat(chunks));
        return;
      }

      resolve(bodyToBuffer(req.body));
    });

    req.on('error', reject);
  });
}

function verifyLineSignature(rawBody, signature, channelSecret) {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', channelSecret)
    .update(rawBody)
    .digest('base64');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function buildFaqReply(text) {
  const normalizedText = String(text || '').trim();

  if (['測驗', '排盤', '開始', '本命仙盤'].some(keyword => normalizedText.includes(keyword))) {
    return '你可以先到本命仙盤網站完成免費測驗，輸入出生資料後，就能看到你的本命靈根、五行靈氣與年度機緣。完成後也可以把本命仙途卡分享給朋友。';
  }

  if (['完整報告', '仙途報告', '報告'].some(keyword => normalizedText.includes(keyword))) {
    return '完整仙途報告正在開放準備中，未來會包含更完整的五行、十神、流年與修行課題解析。你可以先完成免費測驗，我們會優先透過 LINE 通知開放消息。';
  }

  if (['出生時間', '不知道時辰', '時辰不知道'].some(keyword => normalizedText.includes(keyword))) {
    return '如果不知道精準分鐘，可以先不填分鐘；如果不確定時辰，可以先選最接近的時間作為參考。八字排盤會受出生時辰影響，之後若有更準確資料，可以再重新測一次。';
  }

  if (['真人', '客服', '人工'].some(keyword => normalizedText.includes(keyword))) {
    return '我已收到你的需求，若需要真人協助，請留下你想詢問的問題，稍後會由真人回覆你。';
  }

  return '這裡是本命仙盤 LINE 小助手。你可以輸入：測驗、完整報告、出生時間不知道、真人客服，我會協助你找到下一步。';
}

async function replyToLine(replyToken, text, channelAccessToken) {
  const response = await fetch(LINE_REPLY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: 'text',
          text
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE reply API failed: ${response.status} ${errorText}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelSecret || !channelAccessToken) {
    console.error('Missing LINE webhook environment variables', {
      hasChannelSecret: !!channelSecret,
      hasChannelAccessToken: !!channelAccessToken
    });
    res.status(500).json({ error: 'LINE webhook is not configured' });
    return;
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    console.error('Failed to read LINE webhook body', error);
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const signature = req.headers['x-line-signature'];
  if (!verifyLineSignature(rawBody, signature, channelSecret)) {
    console.warn('Invalid LINE webhook signature');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8') || '{}');
  } catch (error) {
    console.error('Failed to parse LINE webhook JSON', error);
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const events = Array.isArray(payload.events) ? payload.events : [];
  const textMessageEvents = events.filter(event =>
    event &&
    event.type === 'message' &&
    event.replyToken &&
    event.message &&
    event.message.type === 'text'
  );

  try {
    await Promise.all(textMessageEvents.map(event =>
      replyToLine(
        event.replyToken,
        buildFaqReply(event.message.text),
        channelAccessToken
      )
    ));
  } catch (error) {
    console.error('Failed to reply to LINE webhook event', error);
    res.status(500).json({ error: 'Failed to reply to LINE event' });
    return;
  }

  res.status(200).json({ ok: true });
};
