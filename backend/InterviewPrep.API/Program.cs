using System.Text;
using InterviewPrep.API.Data;
using InterviewPrep.API.Middleware;
using InterviewPrep.API.Services;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Authentication ───────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey   = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSettings["Issuer"],
            ValidAudience            = jwtSettings["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(secretKey),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ─────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── HttpClient for Ollama ─────────────────────────────────────────────
builder.Services.AddHttpClient<IOllamaService, OllamaService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(15); // LLM cold-start can be slow
});

// ── Application Services ─────────────────────────────────────────────
builder.Services.AddScoped<IAuthService,     AuthService>();
builder.Services.AddScoped<IResumeService,   ResumeService>();
builder.Services.AddScoped<ISessionService,  SessionService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IAnswerService,   AnswerService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IStorageService,  StorageService>();
builder.Services.AddScoped<ResumeParserService>();

// ── Controllers & Swagger ─────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title   = "Interview Prep API",
        Version = "v1",
        Description = "AI-Powered Interview Preparation Platform API"
    });

    // JWT auth button in Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name        = "Authorization",
        Type        = SecuritySchemeType.Http,
        Scheme      = "bearer",
        BearerFormat = "JWT",
        In          = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────
app.UseErrorHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Interview Prep API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

// Serve uploaded files statically
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ── Auto-migrate on startup ───────────────────────────────────────────
using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
try
{
    dbContext.Database.Migrate();
    app.Logger.LogInformation("Database migrated successfully.");
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "An error occurred while migrating the database.");
}

// ── Warm up Ollama model on startup ──────────────────────────────────
try
{
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var ollamaUrl = config["Ollama:BaseUrl"] ?? "http://127.0.0.1:11434";
    var modelName = config["Ollama:DefaultModel"] ?? "qwen3:1.7b";
    
    // Quick reachability check first
    var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
    var httpClient = httpClientFactory.CreateClient();
    httpClient.Timeout = TimeSpan.FromSeconds(5);
    
    app.Logger.LogInformation("Checking Ollama reachability at {Url}...", ollamaUrl);
    var pingResponse = await httpClient.GetAsync($"{ollamaUrl}/api/tags");
    
    if (pingResponse.IsSuccessStatusCode)
    {
        app.Logger.LogInformation("✅ Ollama is reachable. Warming up model '{Model}' (this may take a moment)...", modelName);
        // Fire and forget the warm-up — don't block startup
        _ = Task.Run(async () =>
        {
            using var warmupScope = app.Services.CreateScope();
            var ollamaService = warmupScope.ServiceProvider.GetRequiredService<IOllamaService>();
            await ollamaService.WarmUpModelAsync();
        });
    }
    else
    {
        app.Logger.LogWarning("⚠️ Ollama responded with status {Status}. Model may not load.", pingResponse.StatusCode);
    }
}
catch (Exception ex)
{
    app.Logger.LogError("❌ Ollama not reachable at startup. Run 'ollama run qwen3:1.7b' before using the app. Error: {Message}", ex.Message);
}

app.Run();
