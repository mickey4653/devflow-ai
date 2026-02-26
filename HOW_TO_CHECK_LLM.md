# How to Check if LLM is Being Used

## Three Ways to Verify

### 1. 🎨 Visual Indicator in UI (Easiest)

After clicking "Analyze Workflow", look at the top of the results section:

**Without LLM (Default)**:
```
📋 Deterministic Mock Scoring
Task attributes scored using deterministic keyword-based logic
```
- Gray background
- Clipboard emoji (📋)

**With LLM**:
```
🤖 LLM Scoring Active
Task attributes scored using OpenAI API
```
- Blue background
- Robot emoji (🤖)

### 2. 🖥️ Console Logs (Developer Tools)

Open browser DevTools (F12) → Console tab

**Without LLM**:
```
📋 LLM not enabled - using deterministic mock scoring
```

**With LLM**:
```
🤖 LLM enabled - attempting OpenAI scoring for: Design database schema for users
✅ LLM scoring successful
🤖 LLM enabled - attempting OpenAI scoring for: Implement password hashing
✅ LLM scoring successful
...
```

**If LLM fails**:
```
🤖 LLM enabled - attempting OpenAI scoring for: ...
⚠️ LLM scoring failed, falling back to deterministic mock
```

### 3. 📡 API Response (Advanced)

Check the API response in DevTools → Network tab:

Look for the `scoringMethod` field in the JSON response:

```json
{
  "workflow": {...},
  "classifiedTasks": [...],
  "simulation": {...},
  "scoringMethod": "llm"  // or "deterministic-mock"
}
```

## How to Enable LLM

### Step 1: Get OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 2: Create .env.local File
In your project root, create a file named `.env.local`:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 3: Restart Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Verify
1. Open `http://localhost:3000`
2. Click "Analyze Workflow"
3. Check for 🤖 icon and "LLM Scoring Active" message

## Troubleshooting

### LLM Not Working?

**Check 1: Is the API key set?**
```bash
# In your terminal
echo $OPENAI_API_KEY  # Mac/Linux
echo %OPENAI_API_KEY%  # Windows CMD
$env:OPENAI_API_KEY   # Windows PowerShell
```

**Check 2: Is the .env.local file correct?**
- File must be named exactly `.env.local`
- Must be in project root (same folder as package.json)
- No spaces around the `=` sign
- No quotes around the API key

**Check 3: Did you restart the server?**
- Environment variables are only loaded on server start
- Must stop (Ctrl+C) and restart (`npm run dev`)

**Check 4: Check server console**
Look for error messages in the terminal where you ran `npm run dev`

### Still Using Mock Scoring?

If you see 📋 instead of 🤖:
1. Verify API key is correct (starts with `sk-`)
2. Check you have credits in your OpenAI account
3. Look for error messages in browser console (F12)
4. Check server terminal for error messages

### LLM Failing and Falling Back?

If you see ⚠️ warnings:
- **Rate limit**: Wait a few seconds and try again
- **Invalid API key**: Check your key is correct
- **No credits**: Add credits to your OpenAI account
- **Network error**: Check your internet connection

## Cost Monitoring

With LLM enabled:
- Each task costs ~$0.0001
- 5-task workflow costs ~$0.0005
- Very affordable for testing

Check your usage at [platform.openai.com/usage](https://platform.openai.com/usage)

## Recommendation

**For Demo/Testing**: Use deterministic mock (no API key needed)
- Instant results
- No cost
- Fully reproducible

**For Production**: Enable LLM
- More accurate scoring
- Context-aware analysis
- Still has fallback if it fails
