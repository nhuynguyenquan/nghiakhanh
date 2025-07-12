const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbzyTFPLK-0soB4y0o-Ilf00ZJK-z88i5sl8XK6aiCecAV4jcCtpDvMbRzbbu21jFJxaRg/exec';

function generateToken() {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
}

function sendDataToGAS(action, payload) {
  const token = generateToken();
  const dataToSend = {
    ...payload,
    token: token
  };

  fetch(GAS_BASE_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({
      action: action,
      data: JSON.stringify(dataToSend)
    })
  });

  return token;
}

async function getLogByToken(token) {
  try {
    const res = await fetch(`${GAS_BASE_URL}?action=getLogs&token=${token}`);
    if (!res.ok) throw new Error("Kết nối thất bại");
    const log = await res.json();
    return log.token ? log : null;
  } catch (err) {
    console.error("Lỗi khi lấy trạng thái:", err);
    return null;
  }
}

async function waitForLog(token, maxWait = 10000, interval = 1000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const log = await getLogByToken(token);
    if (log) return log;
    await new Promise(r => setTimeout(r, interval));
  }
  return null;
}
