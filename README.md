# Thesis Chatbot

This is a Google Apps Script chatbot for thesis information that:

- Auto-refreshes its knowledge base from a published CSV.
- Checks banned words before responding.
- Answers from KB if available.
- Falls back to Gemini AI for unknown questions.
- Logs all interactions automatically to a Google Sheet.

## Setup Instructions

1. Create a Google Sheet named `ChatLogs` with headers:
2. Timestamp | Question | Answer Found | Bot Answer
2.1. Copy the Sheet ID from the URL.
3. Create a new Google Apps Script project.
4. Add `Code.gs`, `config.js`, and `index.html` files.
5. Replace `YOUR_GEMINI_API_KEY` and `YOUR_CHATLOG_SHEET_ID` in `config.js`.
6. Deploy the script as a **Web App**:
- Execute as: **Me**
- Who has access: **Anyone**
7. Open the Web App URL and start chatting.
