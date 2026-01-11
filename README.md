# Code Editor - Online IDE with GitHub Integration

A modern, feature-rich online code editor built with React.js, Monaco Editor, Node.js, and WebAssembly. Supports multiple programming languages with real-time execution and GitHub version control integration.

## 🚀 Tech Stack

- **Frontend:**
  - React.js - UI framework
  - Monaco Editor - Code editor (VS Code's editor)
  - Tailwind CSS - Styling
  - Vite - Build tool

- **Backend:**
  - Node.js - Server runtime
  - Express.js - Web framework
  - WebSocket (ws) - Real-time collaboration

- **Execution:**
  - WebAssembly (WASM) - For Python execution
  - JavaScript - Native execution
  - Java - Backend compilation and execution

- **Version Control:**
  - GitHub API - Full integration for save/load/commit operations

## ✨ Features

### Language Support
- **Web Development:** HTML, CSS, JavaScript
- **Programming Languages:** Python, Java
- **Live Preview:** Real-time HTML/CSS/JS preview
- **Code Execution:** Run code directly in the browser or via backend

### GitHub Integration
- 🔐 **Authentication:** GitHub Personal Access Token
- 📁 **Repository Management:** Create, list, and select repositories
- 💾 **Save to GitHub:** Commit code directly to repositories
- 📥 **Load from GitHub:** Load code from existing files
- 📜 **Commit History:** View recent commits for files
- 🔄 **Version Control:** Full CRUD operations via GitHub API

### Editor Features
- Syntax highlighting for all supported languages
- Code autocomplete and IntelliSense
- Multiple language support with easy switching
- Dark theme editor
- Responsive design

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Java JDK (for Java execution)
- GitHub Personal Access Token (for GitHub features)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd code-editor
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

4. **Start the backend server**
```bash
npm start
# Server runs on http://localhost:4000
```

5. **Start the frontend development server**
```bash
cd ../frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔧 Configuration

### GitHub Integration Setup

1. Create a GitHub Personal Access Token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select the `repo` scope
   - Copy the token (starts with `ghp_`)

2. Use the token in the GitHub Panel:
   - Click the "GitHub" button in the editor
   - Paste your token
   - Click "Authenticate"

## 📖 Usage

### Running Code

1. Select a language from the dashboard
2. Write your code in the editor
3. Click "Run" to execute (for code languages)
4. View output in the Output panel

### GitHub Operations

1. Click the "GitHub" button in the editor toolbar
2. Authenticate with your GitHub token
3. Select or create a repository
4. Enter file path (e.g., `code/main.py`)
5. **Save:** Enter commit message and click "Save to GitHub"
6. **Load:** Click "Load from GitHub" to retrieve code

### Web Development Mode

1. Select HTML, CSS, or JavaScript
2. Edit code in separate panels
3. See live preview update automatically

## 🛠️ Project Structure

```
code-editor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx
│   │   │   ├── Preview.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LanguageDashboard.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── GitHubPanel.jsx
│   │   │   └── Output.jsx
│   │   ├── utils/
│   │   │   ├── github.js
│   │   │   ├── runJava.js
│   │   │   └── runWasm.js
│   │   ├── wasm/
│   │   │   └── python.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── wasm/
│   │       └── python.wasm
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── server.js
│   ├── executeCode.js
│   └── package.json
└── README.md
```

## 🔐 Security Notes

- GitHub tokens are stored in localStorage (for development)
- For production, consider using OAuth flow
- Never commit tokens to version control
- Use environment variables for sensitive data

## 🚧 Future Enhancements

- [ ] OAuth authentication for GitHub
- [ ] More language support (Go, Rust, etc.)
- [ ] Real-time collaboration
- [ ] File tree navigation
- [ ] Multiple file support
- [ ] Code sharing via links
- [ ] Themes and customization

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

