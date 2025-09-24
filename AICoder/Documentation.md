# Documentation

## Project Structure
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
│── Documentation.md
│── AICoder.csproj  
│── appsettings.json  
│── Program.cs

## File Descriptions

- AICoder.csproj  
  - Purpose: .NET SDK project file describing target framework, package dependencies, and file copy rules.  
  - Key contents: TargetFramework net8.0, ImplicitUsings enabled, Nullable enabled; PackageReferences for Microsoft.ML, System.Text.Json, Microsoft.Extensions.Configuration, Microsoft.Extensions.Configuration.Json; appsettings.json configured to be copied to output.  
  - Role: Build configuration for the application.

- appsettings.json  
  - Purpose: Runtime configuration for LLM providers and agent-specific settings (model names, API keys, provider selection).  
  - Key contents: DefaultProvider ("gemini"), Agents section with entries for Enhancer, Planner, CodeGen, Docs (each with Model, API_KEY, Provider).  
  - Role: Centralized configuration that LLMProvider reads at startup. NOTE: API keys are stored here in plaintext; they should be rotated and secured (see TODOs).

- Program.cs  
  - Purpose: Console entry point that runs the interactive loop.  
  - Key functions: Reads user task input, asks whether to include full workspace context, and forwards the request to AiAgent.HandleTask.  
  - Role: Lightweight CLI for issuing tasks to the multi-agent pipeline.

- Agents/AiAgent.cs  
  - Purpose: Orchestrator that coordinates the pipeline of sub-agents (Enhancer, Planner, CodeGen, Docs).  
  - Key classes/flow: Instantiates PlannerAgent, CodeGenAgent, EnhancerAgent, DocsAgent. Flow: enhance requirement → load docs → plan → generate/update/delete files → update docs.  
  - Role: High-level control logic that sequences enhancement, planning, code generation, and documentation updates. (Note: a logic condition around contextFiles currently prevents generation in some cases — see TODOs.)

- Agents/EnhancerAgent.cs  
  - Purpose: Sends the raw user requirement to an LLM to "enhance" or clarify the requirement.  
  - Key functions: Enhance(string requirements) — returns the enhanced requirement text (no formatting).  
  - Role: Improves the user's prompt before planning and codegen.

- Agents/PlannerAgent.cs  
  - Purpose: Determines which files should be created, updated, or deleted to satisfy the enhanced requirement.  
  - Key functions: PlanTask(string task, string projectDoc, string context) — calls LLM and parses a JSON PlanResult.  
  - Role: Produces a PlanResult containing arrays for update/create/delete. Handles fallback to empty plan if LLM output can't be parsed.

- Agents/CodeGenAgent.cs  
  - Purpose: Generates or modifies files based on the plan and task using the LLM. Also saves and deletes files.  
  - Key functions: CollectContext(List<string> files) — aggregates file contents for context; GenerateFiles(task, context, plan) — prompts LLM, parses JSON response into filepath→content map, writes files via FileOps, deletes files listed in plan.Delete.  
  - Role: Implements file-level changes resulting from a plan. Uses NewtonSoft.Json to parse responses.

- Agents/DocsAgent.cs  
  - Purpose: Creates or updates README.md documentation describing project structure, file descriptions, dependencies, recent changes, and TODOs.  
  - Key functions: LoadDocumentationAsync() — if README.md missing, generates it from full workspace context; UpdateDocumentationAsync(plan, generatedFiles) — rewrites documentation to reflect new/changed files.  
  - Role: Keeps project documentation in sync with code changes using the LLM. Writes to workspace/README.md.

- Agents/PlannerAgent.cs (note)  
  - Purpose and role described above. (Listed again for clarity.)

- LLM/LLMProvider.cs  
  - Purpose: Centralized client for making LLM requests. Supports two provider modes: "azf-openai" (Azure OpenAI Responses API) and "gemini" (Google Gemini generative language endpoint).  
  - Key functions: ExecutePrompt(prompt) routes to provider-specific methods; GetAzureFoundryOpenAIResponseAsync and GetGeminiResponseAsync implement provider-specific request/response parsing. Reads model/provider/apiKey from appsettings.json for the agent name.  
  - Role: Abstracts API differences and returns raw LLM text. Also logs missing API key to console.

- Models/PlanResult.cs  
  - Purpose: Simple DTO that represents the planner's decision.  
  - Key members: Lists Update, Create, Delete. Initialized to empty lists.  
  - Role: Contract used between PlannerAgent and CodeGenAgent/DocsAgent.

- Services/FileOps.cs  
  - Purpose: Filesystem helper for reading, writing and deleting files inside the workspace directory.  
  - Key functions: SaveFile(path, content), ReadFile(path), DeleteFile(path). Ensures workspace directory exists and creates intermediate directories as needed.  
  - Role: Encapsulates file system operations and path normalization to the "workspace" folder.

- Services/Utility.cs  
  - Purpose: Misc utilities for the application.  
  - Key functions: ParseOutput(this string) — extracts substring between first '{' and last '}' (used to sanitize LLM outputs into JSON), GetContext(this string dirPath) — enumerates allowed files in a directory (filters by extension and excluded directories) and returns their contents in a compact serialized form.  
  - Role: Helps with collecting project context and cleaning up LLM responses.

## Dependencies
- .NET 8.0 (TargetFramework: net8.0)
- NuGet packages referenced in AICoder.csproj:
  - Microsoft.ML (4.0.2)
  - System.Text.Json (9.0.9)
  - Microsoft.Extensions.Configuration (9.0.9)
  - Microsoft.Extensions.Configuration.Json (9.0.9)
- Additional runtime dependencies / third-party usage evident in code:
  - Newtonsoft.Json is used extensively in code (JsonConvert), but it is not present in the project file — add a PackageReference to Newtonsoft.Json (or replace usages with System.Text.Json).
- External services:
  - Google Generative Language API (Gemini) — requires API key and model configuration.
  - Azure OpenAI / OpenAI Responses endpoint — requires endpoint URL and API key for the "azf-openai" provider.
- Notes:
  - API keys are stored in appsettings.json in this scaffold. For production usage, move secrets to secure storage (environment variables or secret vault).