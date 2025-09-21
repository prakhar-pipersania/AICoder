# 📘 AlCoder – AI Coding Agent Framework

AlCoder is a modular AI-powered coding assistant that can **enhance, plan, generate, and maintain codebases** with deterministic project documentation.

---

## 🤝 Contributing

We welcome contributions to **AlCoder**! Whether you want to fix bugs, add features, improve documentation, or create new sample apps based on different Libraries/Framework — your help is appreciated.

### 🚀 How to Contribute

1. **Fork** the repository.
2. **Create a branch** for your feature or fix.
3. **Make your changes** and commit with a clear message.
4. **Push** to your fork and open a **Pull Request**.

### 📌 Contribution Ideas

* Add new **agents** (e.g., testing agent, UI agent).
* Improve **documentation** (tutorials, examples, FAQs).
* Create new **SampleApps** in the workspace and add you prompts in `Prompt.txt`.
* Enhance the **DocsAgent** to produce richer project summaries.
* Optimize **LLM provider integration** (add support for Deepseek, Anthropic, etc.).

### 🛠 Development Setup

* Clone repo & restore dependencies.
* Run locally.

---

## 🔹 Design Approaches

### Option 1: Single LLM for All Tasks

* **Pros**

  * Simpler architecture (one model to manage).
  * Easier key/rate-limit handling.
  * Shared knowledge across tasks.

* **Cons**

  * One model may not be optimal for all subtasks.
  * Risk of hitting token/context limits.
  * Limited flexibility when scaling.

### Option 2: Specialized Agents (Multi-Model)

* **Example**

  * Planner → reasoning model (e.g., GPT-4, Gemini).
  * Code generation → code-specialized model (e.g., CodeLlama).
  * Debugging → lightweight model (e.g., GPT-3.5, Gemini Flash - Lite).

* **Pros**

  * Each agent excels at its role.
  * Better cost/performance tradeoff.
  * Modular: swap/upgrade agents independently.

* **Cons**

  * Higher complexity.
  * Requires orchestration.

### Best Practice – Hybrid

* Orchestrator agent routes tasks.
* Use default model for general flow.
* Call specialized agents for performance-critical tasks (codegen).

---

## 🔹 Core Architecture

### 1. **Orchestrator (AiAgent.cs)**

* Entry point for all tasks.
* Routes to Planner, CodeGen, Enhancer, or Docs agent.

### 2. **EnhancerAgent**

* Improves user requirements.

### 3. **PlannerAgent**

* Reads **README.md**.
* Decides:

  * Which files to create.
  * Which files to update.
  * Which files to delete.
* Returns a structured **PlanResult**.

### 4. **CodeGenAgent**

* Generates **full file content** (not partial patches).
* Uses a code-specialized model.
* Input: task description + relevant file context.

### 5. **DocsAgent**

* Updates **README.md** after each change.
* Keeps project map accurate.
* Summarizes new/modified files.


### 6. **LLMProvider**

* Handles different providers (Gemini, OpenAI, etc.).
* Normalizes API requests and responses.

### 7. **FileOps & Utility**

* File read/write helpers.
* Post-process generated code (strip markdown fences, normalize formatting).

---

## 🔹 Living Documentation vs. RAG

### 🔑 Living Documentation (Default)

* Maintains `README.md` as a **deterministic knowledge base**.
* Stores:

  * File purposes.
  * Project structure.
  * Recent changes.
* Ensures **transparency** (human-readable) and **accuracy**.

### 🔧 Workflow

1. On project creation → AI generates `README.md`.
2. On each task:

   * Load doc → find candidate files.
   * Generate/update/delete files.
   * Save changes.
   * Update doc with summaries.

### 📌 Benefits

* Deterministic → no fuzzy semantic errors.
* Transparent → humans can inspect doc.
* Maintains project evolution.

---

### 🔹 Hybrid with RAG (For Large Projects) - Not Implementated

When the project grows too large:

* Index files in a vector DB (FAISS, Chroma, SQLite).
* Use embeddings for fallback retrieval.
* Apply relevance thresholds (cosine similarity > 0.75).
* Still update `README.md` for determinism.

---

## 🔹 Folder Structure

```
AlCoder
│── Agents
│   ├── AiAgent.cs
│   ├── CodeGenAgent.cs
│   ├── DocsAgent.cs
│   ├── EnhancerAgent.cs
│   └── PlannerAgent.cs
│
│── LLM
│   └── LLMProvider.cs
│
│── Models
│   └── PlanResult.cs
│
│── Services
│   ├── FileOps.cs
│   └── Utility.cs
│
│── appsettings.json
│── Program.cs
```

---

## 🔹 Configuration (appsettings.json)

```json
{
  "DefaultProvider": "gemini",
  "Agents": {
    "Enhancer": {
      "Model": "gemini-2.5-flash-lite",
      "API_KEY": "AIzaSyxxxxx",
      "Provider": "gemini"
    },
    "Planner": {
      "Model": "gemini-2.5-flash-lite",
      "API_KEY": "AIzaSyxxxxx",
      "Provider": "gemini"
    },
    "CodeGen": {
      "Model": "gemini-2.5-flash",
      "API_KEY": "AIzaSyxxxxx",
      "Provider": "gemini"
    },
    "Docs": {
      "Model": "gemini-2.5-flash-lite",
      "API_KEY": "AIzaSyxxxxx",
      "Provider": "gemini"
    }
  }
}
```

---

## 🔹 Challenges & Fixes

| Challenge                                   | Fix                                     |
| ------------------------------------------- | --------------------------------------- |
| LLM returns partial code                    | Enforce **full file return** in prompts |
| Model output differences (Gemini vs OpenAI) | Post-process to normalize formatting    |
| Documentation drift                         | Auto-update + allow manual corrections  |
| Noisy RAG hits                              | Use doc-first + RAG fallback hybrid     |
| Token/context limits in big projects        | Use RAG + chunking per class/function   |

---

## 🔹 Working Sample Apps

AlCoder includes a **`SampleApps` workspace** that demonstrates its ability to plan, generate, and enhance projects end-to-end.

These apps are **generated using AlCoder itself**, with:

* Basic features implemented in the first generation.
* Minor enhancements applied in follow-up prompts.
* Each app folder contains a `Prompt.txt` file showing the exact input prompts used for generation and improvements.

### 📂 Available Sample Apps

1. **.NET WebApi**

   * Basic Web API skeleton with controllers, services, and dependency injection.
   * Demonstrates CRUD setup and Swagger integration.

2. **MiniGamesHub**

   * Collection of simple C# mini-games (e.g., Tic-Tac-Toe, Snakes & Ladders).
   * Showcases multi-class project planning and enhancement flow.

3. **TodoApp**

   * Classic to-do list application.
   * Demonstrates persistence, filters, and incremental feature additions.

---

✅ With this setup, AlCoder becomes a **self-maintaining AI coding agent** with modular agents, and transparent documentation.