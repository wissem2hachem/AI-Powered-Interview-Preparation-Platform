# PrepAI ⚡

PrepAI is an intelligent, AI-powered technical interview preparation platform. It allows users to upload their resumes, configure personalized interview sessions based on specific job roles, and practice answering dynamically generated questions. 

The application uses **Ollama** running locally to maintain data privacy while providing real-time, expert-level feedback on the user's answers.

![Dashboard Preview](frontend/public/favicon.ico) <!-- Add a real screenshot here later! -->

## ✨ Features

- **📄 Resume Analysis**: Upload PDF resumes. The system parses your experience and generates highly contextual interview questions.
- **🎯 Dynamic Interview Sessions**: Practice for specific roles (Frontend, Backend, ML, DevOps, etc.) with questions categorized by technical depth, behavioral scenarios, and system design.
- **🎙️ Voice & Text Answers**: Respond to questions using text or record your answer via microphone.
- **🧠 Local AI Grading (Ollama)**: Answers are graded locally using `qwen3:1.7b` (or any configured Ollama model). You receive a score out of 10, identified strengths, areas to improve, and actionable suggestions.
- **⏭️ Interactive Controls**: Stuck on a question? You can **skip** it or ask the AI to **generate an ideal answer** to learn from.
- **📈 Progress Tracking**: A comprehensive dashboard tracks your average score over time, identifies your strongest/weakest categories, and logs all your historical sessions.
- **🎨 Deep Space Emerald UI**: A premium, custom Vanilla CSS design system featuring glowing components, glassmorphism, and fluid micro-animations.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: Custom Vanilla CSS (Design System defined in `globals.css`)
- **State Management**: React Context & Hooks
- **Data Visualization**: Recharts

### Backend
- **Framework**: [.NET 8](https://dotnet.microsoft.com/) Web API
- **Language**: C#
- **Database**: SQL Server (Entity Framework Core)
- **AI Integration**: Custom HTTP Client communicating with local [Ollama](https://ollama.com/) instances.
- **Authentication**: JWT (JSON Web Tokens)

---

## 🚀 Getting Started

### Prerequisites
1. **Node.js** (v18+)
2. **.NET 8 SDK**
3. **SQL Server** (or SQL Server Express)
4. **Ollama** installed locally (Download from [ollama.com](https://ollama.com/))
5. The **qwen3:1.7b** model pulled into Ollama:
   ```bash
   ollama run qwen3:1.7b
   ```

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/InterviewPrep.API
   ```
2. Update the `ConnectionStrings:DefaultConnection` in `appsettings.json` if necessary to point to your SQL Server instance.
3. Apply the Entity Framework migrations to create the database:
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```
   *The API will typically start on `http://localhost:5275`.*

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 🏗️ Architecture & AI Prompting

- **Contextual Generation**: When an interview session starts, the backend sends the user's parsed resume and the selected job role to Ollama. The prompt explicitly demands highly diverse questions formatted in a strict JSON array.
- **Fast Feedback Loop**: The grading prompt is heavily optimized. It evaluates the answer against the question and the job role, outputting a strict JSON object containing just the score and bullet points to minimize generation time (TTFT).
- **Privacy First**: Because inference runs entirely on your local machine via Ollama, your resume and interview answers are never sent to a cloud provider like OpenAI or Anthropic.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.
