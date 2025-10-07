# Documentation

## Requirements
- .NET 8.0 runtime / SDK.
- Project must run as a console-style worker that orchestrates multi-agent LLM workflows (Enhancer, Planner, CodeGen, Docs).
- Workspace sandbox enforced for file operations (no path traversal, allowed/excluded extensions and directories).
- Resilient HTTP calls for LLM providers (retry policy with exponential backoff).
- Configurable LLM agents via appsettings.json (per-agent Provider, Model, ApiKeyEnv, SystemPrompt, Url).
- Local development fallback to a mock LLM when no API key is set.
- Persist generated files into the workspace and update README.md (except: orchestrator must never perform operations on README.md according to Planner rules — note Planner also enforces this).
- Logging and observability via Serilog.
- New/updated requirements in this snapshot:
  - Workspace files should be enumerated and optionally included as context to the LLM pipeline.
  - Agents pipeline order: Enhance -> Plan -> CodeGen -> Docs. Planner output drives which files are created/updated/deleted.
  - FileService must resolve and sanitize paths, and provide file context aggregation for LLM consumption.

## Project Structure
workspace root (project)
```
DevMind.csproj
Program.cs
appsettings.json
Properties/
  launchSettings.json
Agents/
  AgentOrchestrator.cs
  CodeGenAgent.cs
  DocsAgent.cs
  EnhancerAgent.cs
  PlannerAgent.cs
Interfaces/
  IAgentOrchestrator.cs
  IFileService.cs
  ILLMChat.cs
  ILLMClient.cs
LLM/
  AzureOpenAILLMClient.cs
  GeminiLLMClient.cs
  LLMProvider.cs
  MockLLMClient.cs
Models/
  Constants.cs
  LLMOptions.cs
  PlanResult.cs
  TaskRequestDto.cs
  TaskResponseDto.cs
Services/
  FileService.cs
  HttpBaseClient.cs
  Utility.cs
DevMindWorker.cs
```

## File Descriptions

- DevMind.csproj
  - Purpose: Project file with build configuration and NuGet package references.
  - Key configurations: TargetFramework net8.0, GenerateDocumentationFile enabled, NoWarn for missing XML docs (1591).
  - Role: Declares dependencies (Serilog, Polly, Newtonsoft.Json) and ensures appsettings.json is copied to output.

- appsettings.json
  - Purpose: Runtime configuration for LLM agents and logging.
  - Key sections:
    - LLM: DefaultProvider and per-agent options (Enhancer, Planner, CodeGen, Docs) with Provider, Model, ApiKeyEnv, SystemPrompt, Url.
    - Logging / Serilog: Console sink configuration and minimum level.
  - Role: Central configuration for providers and agent system prompts used by LLMProvider.

- Properties/launchSettings.json
  - Purpose: Development launch profile and environment variables for local debugging.
  - Role: Defines GEMINI_KEY and AZOPENAI_KEY for local runs (sensitive values present in this snapshot; rotate if real).

- Program.cs
  - Purpose: Application bootstrap.
  - Key actions:
    - Configures Serilog, binds LLMOptions from configuration, registers services (MemoryCache, HttpClient, HealthChecks).
    - Registers DI mappings: FileService (IFileService), LLMProvider (ILLMClient), AgentOrchestrator (IAgentOrchestrator), DevMindWorker.
    - Starts the DevMindWorker and logs startup message.
  - Role: Entry point wiring the multi-agent orchestration.

- DevMindWorker.cs
  - Purpose: Interactive console worker that prompts the user for requirements and options then triggers orchestrator.
  - Key flow:
    - Reads user requirements, whether to enhance them, whether to include workspace context.
    - Constructs TaskRequestDto and calls IAgentOrchestrator.HandleTaskAsync.
    - Global exception logging.
  - Role: User-facing loop to initiate the agent pipeline.

- Agents/AgentOrchestrator.cs
  - Purpose: Coordinates the entire agent pipeline (Enhancer -> Planner -> CodeGen -> Docs).
  - Key classes/fields: EnhancerAgent, PlannerAgent, CodeGenAgent, DocsAgent, IFileService.
  - Key flow:
    - Optionally collects file context via FileService.
    - Enhances requirements via EnhancerAgent if requested.
    - Loads existing docs via DocsAgent and runs the PlannerAgent to get PlanResult.
    - Decides which files to include for CodeGen based on plan (create/update).
    - Runs CodeGenAgent to obtain generated file contents (dictionary path->content) and persists them using FileService.
    - Deletes files as per planner decision using FileService.
    - Requests DocsAgent to generate/refresh README.md and persists it (README.md write guarded in Planner rules).
  - Role: High-level orchestrator implementing the development workflow and persisting results.

- Agents/EnhancerAgent.cs
  - Purpose: Enhances user-provided requirements using the configured LLM.
  - Key method: EnhanceAsync(requirement).
  - Role: Prepares clearer/more detailed requirements for planner/codegen agents.

- Agents/PlannerAgent.cs
  - Purpose: Asks the LLM to produce a plan (JSON) describing files to update/create/delete.
  - Key method: PlanAsync(requirement, docs, context) -> PlanResult.
  - Role: Decides file-level operations for the code generation phase. Expects the LLM to return a JSON matching PlanResult shape.

- Agents/CodeGenAgent.cs
  - Purpose: Requests the LLM to generate file contents mapping file paths to content.
  - Key method: GenerateAsync(task, context).
  - Role: Produces code/documentation artifacts as a Dictionary<string, string> which then get persisted.

- Agents/DocsAgent.cs
  - Purpose: Loads existing README.md and can generate/update it using the LLM.
  - Key methods:
    - LoadDocumentationAsync(fileContext): returns README.md if exists, otherwise asks LLM using provided context and saves result.
    - GenerateReadmeAsync(requirements, docs, planjson, fileContext): asks LLM to generate an updated README.
  - Role: Keeps project documentation synchronized with the generated changes.

- Interfaces/IAgentOrchestrator.cs
  - Purpose: Abstraction for the orchestrator entry point.
  - Key method: HandleTaskAsync(TaskRequestDto).
  - Role: Enables decoupled orchestrator implementation and testing.

- Interfaces/IFileService.cs
  - Purpose: Abstraction for workspace file operations.
  - Key methods: ReadFile, SaveFile, DeleteFile, GetFileContext, EnumerateWorkspaceFiles; WorkspaceRoot property.
  - Role: File system sandboxing and context aggregation for LLMs.

- Interfaces/ILLMClient.cs
  - Purpose: Abstraction for executing prompts against configured LLM provider.
  - Key method: ExecutePromptAsync(agentName, prompt).
  - Role: High-level provider used by agents; handles provider selection and resilience.

- Interfaces/ILLMChat.cs
  - Purpose: Lower-level chat interface used by concrete LLM provider implementations.
  - Key method: ChatAsync(userInput, url, model, systemPrompt, apiKey).
  - Role: Encapsulates provider-specific HTTP interaction.

- LLM/LLMProvider.cs
  - Purpose: Selects provider implementation (azure/gemini/mock), reads agent config, handles API key presence, and delegates to provider chat.
  - Key behavior:
    - Reads LLMOptions via IOptions<LLMOptions>.
    - If agent config missing or api key not set, returns a deterministic mock response to keep local dev safe.
    - Instantiates AzureOpenAILLMClient, GeminiLLMClient, or MockLLMClient based on agent Provider.
  - Role: Centralized selection/resilience layer for LLM usage.

- LLM/AzureOpenAILLMClient.cs
  - Purpose: Implements ILLMChat for Azure OpenAI Responses endpoint (schema expected in snapshot).
  - Key method: ChatAsync constructs JSON payload (model + input array with system/user), sets Bearer auth header, posts to configured Url, parses returned JSON to extract text reply.
  - Role: Provider-specific HTTP client for azopenai in this project.

- LLM/GeminiLLMClient.cs
  - Purpose: Implements ILLMChat for Google Gemini (Generative Language) style API.
  - Key method: ChatAsync constructs provider-specific payload (systemInstruction + contents), sets X-goog-api-key, posts to configured Url (with model injected), parses returned JSON.
  - Role: Provider-specific HTTP client for gemini in this project.

- LLM/MockLLMClient.cs
  - Purpose: Lightweight mock implementation of ILLMChat used when no real API key is configured.
  - Behavior: Returns deterministic canned responses keyed by "model" name (enhancer/planner/codegen/docs) to allow offline testing.
  - Role: Safe default for local development.

- Models/LLMOptions.cs
  - Purpose: Configuration models bound from appsettings.json.
  - Types:
    - LLMOptions: DefaultProvider + Dictionary<string, LLMAgentOptions>.
    - LLMAgentOptions: Provider, Model, ApiKeyEnv, SystemPrompt, Url.
  - Role: Typed access to agent configuration.

- Models/Constants.cs
  - Purpose: Lists allowed file extensions, excluded extensions, and excluded directories for workspace enumeration.
  - Role: Drives FileService file filtering and sandboxing logic.

- Models/PlanResult.cs
  - Purpose: DTO representing planner decisions: Update, Create, Delete lists.
  - Role: Shared contract between PlannerAgent and orchestrator.

- Models/TaskRequestDto.cs
  - Purpose: DTO for orchestrator request: Requirements, IncludeContext, EnhanceRequirements.
  - Role: Carries user intent into orchestrator.

- Models/TaskResponseDto.cs
  - Purpose: DTO for orchestrator response: Plan, GeneratedFiles, DeletedFiles, Documentation, CorrelationId.
  - Role: Returns pipeline results to caller.

- Services/FileService.cs
  - Purpose: Secure workspace file operations enforcing a sandbox.
  - Key features:
    - Workspace root initialized under current directory "workspace".
    - Resolve(inputPath): normalizes path separators, resolves to full path inside workspace, throws if outside workspace.
    - EnumerateWorkspaceFiles(): returns allowed files per Constants filters, excludes configured directories and extensions.
    - GetFileContext(files): aggregates file contents into a single string prefixed by "# FILE: {path}" lines for LLM context.
    - ReadFile/SaveFile/DeleteFile: safe file I/O with logging.
  - Role: Central file-system abstraction protecting against traversal and filtering noise files.

- Services/HttpBaseClient.cs
  - Purpose: Base HTTP client providing a shared static HttpClient and retry policy.
  - Key details:
    - HttpClient with infinite timeout.
    - Polly AsyncRetryPolicy that handles exceptions and non-success status codes; retry backoff 5^n seconds (5s, 25s, 125s).
    - Logs retry attempts to console.
  - Role: Resilience foundation for provider HTTP clients (Azure/Gemini).

- Services/Utility.cs
  - Purpose: Helpers for sanitizing LLM raw responses and serializing objects.
  - Key methods:
    - Sanitize<T>(string raw): extracts first JSON object in a string and deserializes it using Newtonsoft.Json; returns default on failure.
    - ToStr<T>(this T obj): serializes an object to JSON string for logging or passing to LLM.
  - Role: Defensive parsing of noisy LLM responses.

## Dependencies
- .NET: TargetFramework net8.0
- NuGet packages (from DevMind.csproj):
  - Serilog.AspNetCore (9.0.0)
  - Serilog.Sinks.Console (6.0.0)
  - Polly (8.6.4)
  - Polly.Extensions.Http (3.0.0)
  - Newtonsoft.Json (13.0.4)
- Runtime configuration:
  - appsettings.json required with LLM section (DefaultProvider and Agents settings).
  - Environment variables used by LLM agents as configured in agent.ApiKeyEnv (examples in launchSettings.json: GEMINI_KEY, AZOPENAI_KEY).
- Logging:
  - Serilog configuration read from appsettings.json; console sink is enabled.
- Notes:
  - HTTP clients rely on the HttpBaseClient's Polly retry policy; ensure network connectivity and correct provider URLs.
  - If no API key present for an agent, LLMProvider returns a mock/deterministic response to avoid accidental calls.

## Recent Changes
- Snapshot summary (files present in this snapshot):
  - Added/updated: DevMind.csproj, Program.cs, appsettings.json, Properties/launchSettings.json.
  - Added/updated Agents: AgentOrchestrator.cs, CodeGenAgent.cs, DocsAgent.cs, EnhancerAgent.cs, PlannerAgent.cs.
  - Added/updated Interfaces: IAgentOrchestrator.cs, IFileService.cs, ILLMChat.cs, ILLMClient.cs.
  - Added/updated LLM implementations: LLMProvider.cs, AzureOpenAILLMClient.cs, GeminiLLMClient.cs, MockLLMClient.cs.
  - Added/updated Models: Constants.cs, LLMOptions.cs, PlanResult.cs, TaskRequestDto.cs, TaskResponseDto.cs.
  - Added/updated Services: FileService.cs, HttpBaseClient.cs, Utility.cs.
  - Added/updated DevMindWorker.cs.
- Deletions: No deleted files detected in this snapshot.
- Notes on changes:
  - The orchestrator pipeline implements an end-to-end flow that now persists generated files and updates README.md (DocsAgent). The Planner enforces not to operate on README.md; maintainers should ensure planner rules are respected by LLM prompts and validation.
  - FileService Resolve now normalizes and validates paths to ensure operations remain inside the workspace root.
  - LLMProvider returns mock responses when API keys are not present to allow safe local development; real deployments must set per-agent ApiKeyEnv environment variables and appropriate Url/Model values in appsettings.json.