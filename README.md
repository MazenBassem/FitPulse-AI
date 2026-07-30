# 🚀 [Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/) Challenge (June–July) 2026

> 🏆 This repository is my official submission for the [ **Tips Hindawi** ](https://www.google.com/search?q=https://www.tipshindawi.com/) **Challenge (June–July) 2026**.

## 👤 Participant

| Field            | Value                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Full Name        | Mazen Bassem                                                                |
| Project Name     | FitPulse AI                                                                 |
| GitHub Username  | MazenBassem                                                                 |
| Challenge Batch  | June–July 2026                                                              |
| Training Program | Large Language Models (LLMs) Program                                        |
| Organization     | **[Edrak for Ai](https://www.google.com/search?q=https://edrak4ai.com/en)** |

---

# 📖 Project Overview

**FitPulse AI** is an intelligent fitness and nutrition tracking application. Designed to streamline health and wellness management, the application allows users to upload or scan images of physical food labels and fitness data. By leveraging Large Language Models, it automatically extracts relevant information and inputs it into an interactive prompt interface to provide real-time insights and personalized feedback.

---

# ✨ Features

- **Instant Label Scanning:** Seamlessly upload nutrition label images via a dedicated top-level scan action.
- **Automated Macro Extraction:** Uses multimodal LLMs to automatically parse calories, protein, carbohydrates, and fat breakdown from uploaded label images.
- **Interactive Query Input:** Automatically formats uploaded image data directly into the chat prompt area for quick follow-up analysis.
- **Real-time Status Updates:** Non-intrusive UI updates that confirm image uploads and system analysis progress.
- **Modern Responsive Interface:** Clean, dark-mode-ready UI designed for fluid desktop and mobile usage.

---

# 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, Modern JavaScript (ES6+)
- **AI & LLM Integration:** Large Language Model API (Multimodal Vision capabilities for OCR and parsing)
- **Design & Styling:** Custom CSS Flexbox/Grid with glassmorphism UI tokens
- **Version Control:** Git & GitHub

---

# ⚙️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/MazenBassem/FitPulse-AI.git
cd FitPulse-AI
```

2. **Set up environment variables:**
   Create a `.env` or configuration file in the root directory and add your API credentials:
   - **Gemini API Key:** Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (see the official [Gemini API Key Quickstart](https://ai.google.dev/gemini-api/docs/api-key)).
   - **ngrok Configuration:** If you are tunneling your local server, follow the official [ngrok Getting Started Guide](https://ngrok.com/docs/getting-started/) to obtain your auth token.

```env
GEMINI_API_KEY=your_gemini_api_key_here
NGROK_AUTHTOKEN=your_ngrok_auth_token_here
```

3. **Run locally:**
   Open `index.html` in your browser of choice or launch via a local web server (e.g., VS Code Live Server).

```bash
python -m http.server 4173 --bind 127.0.0.1
```

---

# 🚀 Usage

1. **Launch the Application:**
   Start the local server and navigate to `http://127.0.0.1:4173` in your web browser.

2. **Generate Custom Workout Splits & Recommendations:**
   - Enter your fitness goals, target muscle groups, and training frequency to get custom-tailored workout splits (e.g., Push/Pull/Legs, Upper/Lower, Arnold Split).
   - Request specific exercise selections, volume guidelines, and progressive overload strategies adjusted to your experience level.

3. **Analyze InBody Scans & Track Body Composition:**
   - Upload an image of your **InBody analysis report** to automatically extract metrics like Skeletal Muscle Mass (SMM), Body Fat Percentage (PBF), and Basal Metabolic Rate (BMR).
   - Receive immediate feedback on how to adjust your training split based on your current muscular balance and body composition data.

4. **Scan Labels & Get AI Nutritionist Guidance:**
   - Click the **📷 Scan Label** button to upload a food nutrition label for an instant macro and calorie breakdown.
   - Query the AI nutritionist for meal timing, post-workout nutrition, and daily target adjustments aligned with your workout regimen.

---

# 📸 Demo

_Dashboard preview and scanning workflow:_

_Figure 1: Main FitPulse AI interface_
[![FitPulse AI Dashboard](assets\dashboard2.png)](assets\dashboard2.png)

_Figure 2: Nutrition label scan in action_
[![Nutrition AI Dashboard](assets\inBody.png)](assets\inBody.png)

---

# 📈 Results

- Reduced manual entry time for nutritional logging by automatically extracting text from food labels.
- Integrated dynamic error-handling to prevent UI layout shifts and double-click event bugs.
- Successfully built a responsive end-to-end interface connecting vision AI capabilities with user dietary queries.

---

# 🔮 Future Improvements

- **Direct Image Processing:** Direct base64 image streaming to the LLM backend for instant visual preview before processing.
- **Dietary Goal Matching:** Compare scanned label metrics against user-customized daily macro goals.
- **History & Exporting:** Save previous label scans and export nutrition logs to JSON/CSV formats.

---

# 📚 About the Challenge

This project was developed as part of the **[Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/)** **Challenge (June–July) 2026**.

[Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/) is the internships department of **[Edrak for Ai](https://www.google.com/search?q=https://edrak4ai.com/en)**, and the challenge encourages participants to build real-world projects, apply practical skills, and showcase their work through GitHub.

For more information about the challenge, training programs, and upcoming batches, visit the official [Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/) website.

---

# 📄 License

This project is shared for educational and portfolio purposes.
