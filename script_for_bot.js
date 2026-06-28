const conversation = [
  {
    role: "system",
    content: `
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
