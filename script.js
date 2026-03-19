const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const LOG_API = "https://script.google.com/macros/s/AKfycbze3yVdySjDVy2MOi9SuZgzAOGe09VMx5d8RruXMemn7_IdG8B7LLDLOPDa1ApNvDmvvQ/exec";

let knowledgeBase = [];

async function loadSheetData() {
  const response = await fetch(sheetURL);
  const csv = await response.text();
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  knowledgeBase = parsed.data;
}

loadSheetData();

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function searchSheet(question) {
  question = question.toLowerCase();
  for (const row of knowledgeBase) {
    if (!row["User Question"]) continue;
    const q = row["User Question"].toLowerCase();
    if (question.includes(q) || q.includes(question)) {
      return row["Bot Answer"];
    }
  }
  return null;
}

async function logQuestion(question, found, answer) {
  try {
    await fetch(LOG_API, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, found, answer })
    });
  } catch (error) {
    console.log("Logging error:", error);
  }
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;
  addMessage(message, "user");
  input.value = "";
  input.focus();

  // search Google Sheet
  let sheetAnswer = searchSheet(message);
  if (sheetAnswer) {
    addMessage(sheetAnswer, "bot");
    logQuestion(message, "Yes", sheetAnswer);
  } else {
    const fallbackAnswer = "Sorry, I don't have an answer for that yet.";
    addMessage(fallbackAnswer, "bot");
    logQuestion(message, "No", fallbackAnswer);
  }
}

document.getElementById("userInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
// -------------------
// DARK MODE TOGGLE
// -------------------
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
