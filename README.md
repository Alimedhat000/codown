# Codown

**Codown** is a real-time collaborative Markdown editor inspired by HackMD and Notion.  
It’s a personal project to explore real-time synchronization using WebSockets and rich-text editing in the browser.

---

## Features

- Real-time collaborative editing (Yjs + Hocuspocus)
- Markdown syntax highlighting and preview
- React-based frontend with clean architecture
- PostgreSQL + Prisma for structured persistence

---

## Tech Stack

| Layer      | Technology                                                   |
|------------|--------------------------------------------------------------|
| Frontend   | [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| Editor     | [CodeMirror](https://codemirror.net/) + [React Markdown](https://github.com/remarkjs/react-markdown) |
| Backend    | [Express](https://expressjs.com/)                            |
| Database   | [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) |
| Realtime   | [Yjs](https://yjs.dev/) + [Hocuspocus](https://docs.hocuspocus.dev/) |
| Package Manager | [pnpm](https://pnpm.io/)                                |

---

## Getting Started



### 1. Clone the Repository

```bash
git clone https://github.com/Alimedhat000/codown.git
cd codown
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Make sure you install Postgre and have a db up and running 

### 4. Setup Environment Variables
Create a .env file based on the example provided:

```bash
cp .env.example .env
```

Update the environment variables as needed (e.g., database URL).

### 5. Start Development Server
```bash
pnpm dev
```
## Roadmap
- ~~Polish The UI~~ (Done ＼(＾▽＾)／)
- ~~Document Sharing with User authorization~~ ヽ(*≧ω≦)ﾉ
- Export documents to PDF
- Version history and timeline
- Testing and Improving CI setup
- ~~Maybe Deployment~~ d=(´▽｀)=b

## Screenshots
To be added cuz im lazy (* ^ ω ^)



