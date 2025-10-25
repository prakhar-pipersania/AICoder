using AICoder.Infrastructure.LLM;
using DevMind;
using DevMind.Agents;
using DevMind.Interfaces;
using DevMind.Models;
using DevMind.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Configuration & Options
builder.Services.Configure<LLMOptions>(builder.Configuration.GetSection("LLM"));

// Core services
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

// Health checks (add Redis if configured in real deployments)
builder.Services.AddHealthChecks();

// Application DI (abstractions & implementations)
builder.Services.AddSingleton<IFileService, FileService>();
builder.Services.AddSingleton<ILLMClient, LLMProvider>();
builder.Services.AddScoped<IAgentOrchestrator, AgentOrchestrator>();
builder.Services.AddSingleton<DevMindWorker>();

var app = builder.Build();

var devMind = app.Services.GetService<DevMindWorker>();
var logger = app.Services.GetService<ILogger<Program>>();
logger?.LogInformation("Welcome to DevMind!");
await devMind.Start();