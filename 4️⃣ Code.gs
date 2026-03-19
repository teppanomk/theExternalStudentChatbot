// Code.gs

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

// Fetch CSV and convert to JSON
function fetchCSV(url) {
  const response = UrlFetchApp.fetch(url);
  const csv = Utilities.parseCsv(response.getContentText());
  const headers = csv[0];
  const data = csv.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return data;
}

// Check for banned words
function containsBannedWords(input, bannedWords) {
  const lowerInput = input.toLowerCase();
  return bannedWords.some(word => lowerInput.includes(word.toLowerCase()));
}

// Search KB for exact match
function findAnswer(question, kb) {
  question = question.toLowerCase();
  for (let entry of kb) {
    if (entry["User Question"].toLowerCase() === question) {
      return entry["Bot Answer"];
    }
  }
  return null;
}

// Query Gemini AI
function queryGeminiAI(prompt) {
  const payload = {
    prompt: prompt,
    temperature: 0.7,
    max_output_tokens: 500
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + CONFIG.GEMINI_API_KEY },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(CONFIG.GEMINI_API_URL, options);
  const json = JSON.parse(response.getContentText());
  return json?.candidates?.[0]?.content || "Sorry, I could not generate an answer.";
}

// Log chat to Google Sheet
function logChat(timestamp, question, answerFound, botAnswer) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CHATLOG_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.CHATLOG_SHEET_NAME);
    sheet.appendRow([timestamp, question, answerFound, botAnswer]);
  } catch (e) {
    console.error("Failed to log chat: " + e);
  }
}

// Main function to handle user input
function handleUserInput(question) {
  // Refresh KB and banned words every time
  const kb = fetchCSV(CONFIG.KB_CSV_URL);
  const bannedWordsList = fetchCSV(CONFIG.BANNED_WORDS_URL).map(row => row["A (banned_words)"]);

  if (containsBannedWords(question, bannedWordsList)) {
    const warning = "Your input contains banned words. Please rephrase.";
    logChat(new Date().toISOString(), question, "No", warning);
    return warning;
  }

  let answer = findAnswer(question, kb);
  let answerFound = "Yes";

  if (!answer) {
    answer = queryGeminiAI(question);
    answerFound = "No";
  }

  logChat(new Date().toISOString(), question, answerFound, answer);
  return answer;
}
