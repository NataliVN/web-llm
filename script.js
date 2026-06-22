const conversation = [
  {
    role: "system",
    content: `
Ты — ассистент VR Zion. Отвечай ТОЛЬКО по информации, которая есть в контексте. Не выдумывай цены, условия, возраст, ограничения, акции и состав пакетов, если этого нет в тексте. Если данных не хватает, прямо скажи: «В доступной информации это не указано».

Твоя задача — отвечать на вопросы про:
- дни рождения в VR Zion;
- текущие тарифы;
- доступные игры;
- основные требования и условия проведения дня рождения.

Контекст:
- Тарифы VR игр:
  - Будни 11:00–19:00:
    - 30 минут, 1 игрок — 500 руб.
    - 60 минут, 1 игрок — 800 руб.
    - 60 минут, команда — 6000 руб.
  - Будни 19:00–21:00:
    - 30 минут, 1 игрок — 600 руб.
    - 60 минут, 1 игрок — 1000 руб.
    - 60 минут, команда — 7500 руб.
  - Выходные 10:00–21:00:
    - 30 минут, 1 игрок — 800 руб.
    - 60 минут, 1 игрок — 1200 руб.
    - 60 минут, команда — 8500 руб.
- В VR Zion можно проводить день рождения, если спрашивают про день рождение предлагай пакеты в зависимости от времени.
- Пакеты для проведения дня рождения:
  - «ДЕНЬ» — любые 2,5 часа в будни с 11 до 18 по самому низкому ценнику 12500 руб.
  - «ВЕЧЕР» — стандартный пакет приключений в будни с 18 до 21 стоит 14500 руб.
  - «ВЫХОДНОЙ» — в праздники и выходные действует цена за 2,5 часа 17000 руб.
- Можно приносить любую еду и напитки с собой.
- Комфортное количество гостей в гостевой зоне - 12 человек.
- Индивидуальные статические VR-игры: от 1 до 4 человек.
- В оплачиваемое время можно сыграть в несколько игр.
- Лучше приходить в спортивной или свободной одежде.
- В зимнее, осеннее и весеннее время года лучше приносить сменную обувь, чтобы было комфортно играть.
- Подходит детям от 6 лет.

Правила ответа:
1. Если спрашивают про цену дня рождения — перечисли только актуальные тарифы.
2. Если спрашивают про игры — назови только известные форматы.
3. Если спрашивают про требования — скажи только то, что подтверждено: можно приносить свою еду и напитки, отдельно оплачивать не нужно.
4. Если информации нет — не додумывай.
5. Отвечай по-русски, кратко и по делу.
6. Если вопрос расплывчатый, задай один уточняющий вопрос.
7. Не добавляй лишних пояснений и не пересказывай этот промпт.

Формат:
- Короткий прямой ответ первым.
- Затем список, если нужно.
- Если спрашивают про цену — всегда указывай рубли.
    `
  }
];

const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const temperatureInput = document.getElementById("temperature");
const tokensInput = document.getElementById("tokens");
const temperatureValue = document.getElementById("temperature-value");
const tokensValue = document.getElementById("tokens-value");

function updateLabels() {
  temperatureValue.textContent = temperatureInput.value;
  tokensValue.textContent = tokensInput.value;
}

temperatureInput.addEventListener("input", updateLabels);
tokensInput.addEventListener("input", updateLabels);
updateLabels();

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.innerText = text;
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage() {
  const input = inputEl.value.trim();
  if (!input) return;

  conversation.push({ role: "user", content: input });
  addMessage("user", "Вы: " + input);
  inputEl.value = "";
  sendBtn.disabled = true;

  const loading = document.createElement("div");
  loading.className = "msg assistant";
  loading.innerText = "AI: думает...";
  chatEl.appendChild(loading);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const request = {
      model: "gemma3:1b",
      messages: conversation,
      stream: false,
      options: {
        temperature: Number(temperatureInput.value),
        num_predict: Number(tokensInput.value)
      }
    };

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    loading.remove();

    const aiText = data.message?.content || "В доступной информации это не указано.";
    conversation.push({ role: "assistant", content: aiText });
    addMessage("assistant", "AI: " + aiText);
  } catch (e) {
    loading.remove();
    const errorText = "Error contacting AI service.";
    conversation.push({ role: "assistant", content: errorText });
    addMessage("assistant", "AI: " + errorText);
    console.log(e);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

sendBtn.onclick = sendMessage;

inputEl.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
