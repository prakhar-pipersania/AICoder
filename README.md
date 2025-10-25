# 📘 DevMind – AI Coding Agent Framework

DevMind is a modular AI-powered coding assistant agent that can **plan, generate, and maintain codebases** with deterministic project documentation. It also lets you ask questions directly about your codebase and supports checkpoints, allowing you to easily revert any changes made by the agent.

---

## 🤝 Contributing

We welcome contributions to **DevMind**! Whether you want to fix bugs, add features, or improve documentation, — your help is appreciated.

### 🚀 How to Contribute

1. **Fork** the repository.
2. **Create a branch** for your feature or fix.
3. **Make your changes** and commit with a clear message.
4. **Push** to your fork and open a **Pull Request**.

### 📌 Contribution Ideas

* Add new **agents** or workflows (e.g., testing agent, UI agent).
* Improve **documentation** (tutorials, examples, FAQs) or enhance the **DocsAgent** to produce richer project summaries.
* Optimize **LLM provider integration** (add support for Deepseek, Anthropic, etc.).

### 🛠 Development Setup

* Clone repo & restore dependencies.
* Add Keys (Azure OpenAI or Gemini) in launchSettings.json
* Run, use and test locally.

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
  * Code generation → code-specialized model (e.g., GPT-5).
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

### 1. **Orchestrator**

* Entry point for all tasks.
* Routes to Query agent for user queries.
* Routes to Planner, CodeGen, or Docs agent.
* Restores checkpoint.

### 2. **QueryAgent**

* Queries and responds to user based on documentation and implementation.

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

* Handles different providers (Gemini, Azure OpenAI, etc.).
* Normalizes API requests and responses.

### 7. **Services**

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

### 🔹 Hybrid with RAG (For Large Projects) - Todo

When the project grows too large:

* Index files in a vector DB (FAISS, Chroma, SQLite).
* Use embeddings for fallback retrieval.
* Apply relevance thresholds (cosine similarity > 0.75).
* Still update `README.md` for determinism.

---

## 🔹 Challenges & Fixes

| Challenge                                   | Fix                                     |
| ------------------------------------------- | --------------------------------------- |
| LLM returns partial code                    | Enforce **full file return** in prompts |
| Model output differences (Gemini vs OpenAI) | Post-process to normalize formatting    |
| Documentation drift                         | Auto-update + allow manual corrections  |
| Noisy RAG hits                              | Use doc-first + RAG fallback hybrid     |
| Token/context limits in big projects        | Use RAG + chunking per class/function   |
