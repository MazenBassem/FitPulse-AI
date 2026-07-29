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

**FitPulse AI** is a specialized, multimodal fitness and nutrition coaching engine powered by a fine-tuned **Qwen2.5-7B-Instruct** model. Built to bridge fine-tuned LLMs with real-world applications, FitPulse AI delivers real-time streaming workout advice, nutritional guidance, and direct analysis of **InBody scan images** to extract body composition metrics.

The architecture uses a hybrid pipeline designed for efficiency: local GPU inference via **Ollama**, an async **FastAPI** backend running in a cloud execution environment (Kaggle), and an interactive **React** frontend that dynamically renders structured exercise cards and streams model outputs live.

---

# ✨ Features

- **Custom Fine-Tuned LLM (`fitpulse-ai`):** Specialized GGUF model (`Q4_K_M`) optimized for precise fitness routines, macro breakdowns, and formatted JSON output.
- **Multimodal InBody Scan Analysis:** Parses base64-encoded body composition reports directly through Ollama's vision capabilities.
- **Real-Time Token Streaming:** High-performance async token streaming using `StreamingResponse` for sub-second visual feedback.
- **Dynamic Exercise Card Parsing:** Automatic frontend regex extraction of structured `[EXERCISE: {...}]` tags to display interactive exercise cards.
- **CORS-Proof Image Proxy:** Built-in proxy endpoint (`/api/image`) to handle dynamic exercise media fetching without browser CORS restrictions.
- **Hybrid Distributed Execution:** Seamless tunnel-based linkage connecting local hardware, cloud backend runtimes, and web frontends.

---

# 🛠️ Technologies Used

- **Language Model & Inference:** Unsloth, Qwen2.5-7B-Instruct, GGUF Quantization (`Q4_K_M`), Ollama, ChatML Format.
- **Backend Framework:** Python 3.12, FastAPI, Uvicorn, `httpx`, `pyngrok`, `nest_asyncio`, Pydantic.
- **Tunnels & Networking:** Cloudflare Tunnels (`cloudflared`), Ngrok.
- **Frontend:** React, Vite, JavaScript (ES6+), Modern CSS.

---

# ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MazenBassem/fitpulse-ai.git
cd fitpulse-ai

```

### 2. Environment Prerequisites

- Install **Ollama** locally from [ollama.com](https://www.google.com/search?q=https://ollama.com/).
- Install **Cloudflare Tunnels (`cloudflared`)** on your local machine:

```powershell
winget install --id Cloudflare.cloudflared

```

### 3. Backend Python Dependencies

Inside your Python or Kaggle environment, install:

```bash
pip install fastapi uvicorn httpx pyngrok nest_asyncio pydantic requests

```

### 4. Frontend Dependencies

Navigate to the frontend folder and install Node packages:

```bash
cd frontend
npm install

```

---

# 🚀 Usage

### Step 1: Terminal Command to Run Ollama & Cloudflare Tunnel (Local Machine)

1. Open **PowerShell** on your local PC, configure Ollama to accept incoming connections, and start the local engine:

```powershell
$env:OLLAMA_HOST="0.0.0.0"
ollama serve

```

2. Open a **second terminal window** and launch a Cloudflare Tunnel to expose your local Ollama port (`11434`) to your cloud backend:

```powershell
cloudflared tunnel --url http://localhost:11434

```

_Copy the generated `.trycloudflare.com` URL from the output (e.g., `[https://your-subdomain.trycloudflare.com](https://your-subdomain.trycloudflare.com)`)._

---

### Step 2: Running the Notebook (Kaggle / Cloud Backend)

1. Open your Kaggle / Jupyter notebook containing your FastAPI application code.
2. In the `server.py` code cell, update `LOCAL_OLLAMA_TUNNEL` with your active Cloudflare URL:

```python
LOCAL_OLLAMA_TUNNEL = "https://your-subdomain.trycloudflare.com"

```

3. Run the `%%writefile server.py` cell to generate the file on disk.
4. Execute the server launcher cell to purge cached modules and start Uvicorn with Ngrok:

```python
import sys
import uvicorn
from pyngrok import ngrok

# Force purge old module cache if restarting
if "server" in sys.modules:
    del sys.modules["server"]

NGROK_TOKEN = "YOUR_NGROK_AUTHTOKEN_HERE"
ngrok.set_auth_token(NGROK_TOKEN)

try:
    ngrok.kill()
except Exception:
    pass

public_url = ngrok.connect(8000)
print(f"\n🚀 PASTE THIS URL INTO REACT:\n{public_url.public_url}/api/chat\n")

config = uvicorn.Config("server:app", host="0.0.0.0", port=8000)
server = uvicorn.Server(config)
await server.serve()

```

_Copy the generated `[https://xxxx.ngrok-free.app/api/chat](https://xxxx.ngrok-free.app/api/chat)` URL._

---

### Step 3: Command to Run the React Frontend App

1. In your terminal, navigate to your React project directory:

```bash
cd frontend

```

2. Start the Vite development server:

```bash
npm run dev

```

3. Open `http://localhost:5173` in your browser.
4. Paste the **Ngrok `/api/chat` endpoint** into the top API configuration bar and start chatting or uploading InBody scans!

---

# 📸 Demo

_(Include screenshots of your React UI, streaming responses, and exercise card rendering here)_

```
+-----------------------------------------------------------------------+
|  [FitPulse AI Dashboard]                                              |
|  API Endpoint: [ https://xxxx.ngrok-free.app/api/chat ] [ Connected ] |
|                                                                       |
|  User: Analyze my InBody scan and recommend a leg exercise.           |
|  FitPulse AI: Based on your skeletal muscle mass ratio...             |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [ EXERCISE CARD ]                                               |  |
|  | Barbell Romanian Deadlift                                       |  |
|  | Image Preview & Setup Guidance                                  |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+

```

---

# 📈 Results

- **Optimized Model Execution:** Successfully quantized fine-tuned model weights to 4-bit (`Q4_K_M`), keeping VRAM usage under 6 GB while maintaining text quality.
- **Low-Latency Streaming:** Reduced initial Response Time to First Token (TTFT) significantly via HTTP stream piping across Cloudflare and Ngrok tunnels.
- **Multimodal Capability:** Achieved accurate extraction of fat mass, muscle balance, and basal metabolic rate directly from user-uploaded InBody images.

---

# 🔮 Future Improvements

- **User Profile Memory:** Add persistent vector database storage for long-term workout history and user fitness goals.
- **Macro Tracker Tooling:** Implement automated JSON schema parsers for calorie/macro counting directly into a visual dashboard.
- **Enhanced Visual Cards:** Integrate short demonstration video clips inside the exercise card parser.

---

# 📚 About the Challenge

This project was developed as part of the **[Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/)** **Challenge (June–July) 2026**.

[Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/) is the internships department of **[Edrak for Ai](https://www.google.com/search?q=https://edrak4ai.com/en)**, and the challenge encourages participants to build real-world projects, apply practical skills, and showcase their work through GitHub.

For more information about the challenge, training programs, and upcoming batches, visit the official [Tips Hindawi](https://www.google.com/search?q=https://www.tipshindawi.com/) website.

---

# 📄 License

This project is shared for educational and portfolio purposes.
