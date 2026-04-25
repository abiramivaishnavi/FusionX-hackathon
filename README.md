# CyberPulse 🛡️⚡

**CyberPulse** is an AI-powered Threat Intelligence Command Center designed to help security analysts track, analyze, and mitigate real-time cyber threats. With a futuristic dark-mode glassmorphism UI, it integrates live CVE data with AI-driven summaries and mitigation recommendations.

![CyberPulse Preview](./frontend/public/default-avatar.png) *(Add a screenshot of your dashboard here)*

## ✨ Features

- **Live Threat Intelligence:** Tracks active threats globally using interactive threat maps and dashboards.
- **AI-Powered Analysis:** Uses Groq AI to generate actionable summaries and mitigation steps for complex CVEs.
- **Real-Time Analytics:** Visualizes threat severities, attack vectors, and historical trends.
- **Secure Authentication:** Robust user authentication (Email/Password & Google) powered by Firebase Auth.
- **Futuristic UI/UX:** Stunning cyber-aesthetic design built with React, Tailwind CSS, and Framer Motion.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (with custom glassmorphism & neon effects)
- **Animations:** Framer Motion
- **Authentication:** Firebase Auth
- **Routing:** React Router DOM

### Backend
- **Environment:** Node.js & Express
- **APIs Integrated:** 
  - National Vulnerability Database (NVD) API
  - Groq AI (for AI Threat Summarization)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/CyberPulse.git
cd CyberPulse
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NVD_API_KEY=your_nvd_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```
Start the backend server:
```bash
npm run dev
# or
node index.js
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```
*(Make sure your Firebase config in `src/lib/firebase.ts` is updated with your project credentials)*

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the App
Open your browser and navigate to `http://localhost:5173`.

## 🔒 Environment Variables Security
- **Never** commit your `.env` files or API keys to GitHub.
- The `frontend/.env` variables must be prefixed with `VITE_` to be accessible in the React app.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License
This project is licensed under the MIT License.
