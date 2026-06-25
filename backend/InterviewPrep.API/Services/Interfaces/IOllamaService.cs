namespace InterviewPrep.API.Services.Interfaces;

public interface IOllamaService
{
    Task<string> GenerateAsync(string prompt, string model = "");
    Task<string> GenerateWithSystemAsync(string systemPrompt, string userPrompt, string model = "");
    Task WarmUpModelAsync();
}
