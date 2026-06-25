using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using InterviewPrep.API.Services.Interfaces;

namespace InterviewPrep.API.Services;

public class OllamaService : IOllamaService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OllamaService> _logger;
    private readonly string _baseUrl;
    private readonly string _defaultModel;

    public OllamaService(HttpClient httpClient, IConfiguration config, ILogger<OllamaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = config["Ollama:BaseUrl"] ?? "http://127.0.0.1:11434";
        _defaultModel = config["Ollama:DefaultModel"] ?? "qwen3:1.7b";
    }

    public async Task<string> GenerateAsync(string prompt, string model = "")
    {
        return await GenerateWithSystemAsync(string.Empty, prompt, string.IsNullOrEmpty(model) ? _defaultModel : model);
    }

    public async Task<string> GenerateWithSystemAsync(string systemPrompt, string userPrompt, string model = "")
    {
        var resolvedModel = string.IsNullOrEmpty(model) ? _defaultModel : model;

        var messages = new List<object>();
        if (!string.IsNullOrWhiteSpace(systemPrompt))
            messages.Add(new { role = "system", content = systemPrompt });
        messages.Add(new { role = "user", content = userPrompt });

        var requestBody = new
        {
            model = resolvedModel,
            messages,
            stream = false,
            options = new
            {
                temperature = 0.3,
                top_p = 0.9,
                num_predict = 2048
            }
        };

        _logger.LogInformation("Calling Ollama model '{Model}' at {BaseUrl}", resolvedModel, _baseUrl);

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.PostAsync($"{_baseUrl}/api/chat", content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to Ollama at {BaseUrl}", _baseUrl);
            throw new InterviewPrep.API.Exceptions.AppException(
                $"Cannot reach Ollama at {_baseUrl}. Make sure 'ollama run {resolvedModel}' is running. Details: {ex.Message}");
        }

        if (!response.IsSuccessStatusCode)
        {
            var errBody = await response.Content.ReadAsStringAsync();
            _logger.LogError("Ollama returned {StatusCode}: {Error}", response.StatusCode, errBody);
            throw new InterviewPrep.API.Exceptions.AppException(
                $"Ollama API error ({response.StatusCode}): {errBody}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();

        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var messageContent = doc.RootElement
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? string.Empty;

            _logger.LogInformation("=== RAW OLLAMA OUTPUT ===\n{Raw}\n=========================", messageContent);

            // Use regex to strip ALL <think>...</think> blocks (qwen3 emits these for reasoning)
            var stripped = Regex.Replace(
                messageContent,
                @"<think>[\s\S]*?</think>",
                string.Empty,
                RegexOptions.IgnoreCase).Trim();

            _logger.LogInformation("=== STRIPPED OUTPUT ===\n{Stripped}\n=======================", stripped);

            // If stripping left nothing, the model only "thought" with no output — return raw for diagnostics
            if (string.IsNullOrWhiteSpace(stripped))
            {
                _logger.LogWarning("Stripping <think> tags left an empty string — returning raw for diagnostics.");
                return messageContent;
            }

            return stripped;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Ollama response envelope: {Response}", responseJson);
            throw new InterviewPrep.API.Exceptions.AppException(
                $"Failed to parse Ollama response envelope. Error: {ex.Message}");
        }
    }

    /// <summary>
    /// Sends a short warm-up ping to load the model into memory before the first real request.
    /// </summary>
    public async Task WarmUpModelAsync()
    {
        try
        {
            _logger.LogInformation("Warming up Ollama model '{Model}'...", _defaultModel);
            await GenerateWithSystemAsync(string.Empty, "Say only: OK", _defaultModel);
            _logger.LogInformation("✅ Ollama model '{Model}' is warm and ready.", _defaultModel);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("⚠️ Model warm-up failed (non-fatal): {Message}", ex.Message);
        }
    }
}
