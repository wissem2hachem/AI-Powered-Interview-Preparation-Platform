using System.Text.Json;
using InterviewPrep.API.Data;
using InterviewPrep.API.DTOs.Question;
using InterviewPrep.API.Exceptions;
using InterviewPrep.API.Models;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Services;

public class QuestionService : IQuestionService
{
    private readonly AppDbContext _db;
    private readonly IOllamaService _ollama;
    private readonly ResumeParserService _parser;
    private readonly ILogger<QuestionService> _logger;

    public QuestionService(
        AppDbContext db,
        IOllamaService ollama,
        ResumeParserService parser,
        ILogger<QuestionService> logger)
    {
        _db = db;
        _ollama = ollama;
        _parser = parser;
        _logger = logger;
    }

    public async Task<List<QuestionResponse>> GenerateQuestionsAsync(Guid userId, GenerateQuestionsRequest request)
    {
        var session = await _db.InterviewSessions
            .Include(s => s.Resume)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == userId)
            ?? throw new NotFoundException("Session", request.SessionId);

        if (session.Status != SessionStatus.InProgress)
            throw new AppException("Cannot generate questions for a completed session.");

        // Remove any previously generated questions
        var existing = await _db.Questions.Where(q => q.SessionId == request.SessionId).ToListAsync();
        if (existing.Count > 0)
        {
            _db.Questions.RemoveRange(existing);
            await _db.SaveChangesAsync();
        }

        var resumeText = _parser.TruncateForPrompt(session.Resume.ParsedText ?? "No resume text available.");
        var systemPrompt = BuildSystemPrompt();
        var userPrompt   = BuildUserPrompt(session.JobRole, resumeText, request.Count);

        var rawJson = await _ollama.GenerateWithSystemAsync(systemPrompt, userPrompt);

        var aiQuestions = ParseQuestionsFromJson(rawJson);

        if (aiQuestions.Count == 0)
            throw new AppException("AI failed to generate valid questions. Please try again.");

        var questions = aiQuestions
            .Take(request.Count)
            .Select((q, i) => new Question
            {
                SessionId  = request.SessionId,
                Text       = q.text,
                Category   = ParseCategory(q.category),
                Difficulty = ParseDifficulty(q.difficulty),
                OrderIndex = i + 1
            }).ToList();

        session.TotalQuestions = questions.Count;

        _db.Questions.AddRange(questions);
        await _db.SaveChangesAsync();

        return questions.Select(MapToResponse).ToList();
    }

    public async Task<List<QuestionResponse>> GetSessionQuestionsAsync(Guid userId, Guid sessionId)
    {
        // Verify session belongs to user
        var sessionExists = await _db.InterviewSessions
            .AnyAsync(s => s.Id == sessionId && s.UserId == userId);

        if (!sessionExists)
            throw new NotFoundException("Session", sessionId);

        var questions = await _db.Questions
            .Where(q => q.SessionId == sessionId)
            .OrderBy(q => q.OrderIndex)
            .ToListAsync();

        return questions.Select(MapToResponse).ToList();
    }

    public async Task<string> GetIdealAnswerAsync(Guid userId, Guid questionId)
    {
        var question = await _db.Questions
            .Include(q => q.Session)
            .FirstOrDefaultAsync(q => q.Id == questionId)
            ?? throw new NotFoundException("Question", questionId);

        if (question.Session.UserId != userId)
            throw new UnauthorizedException();

        var systemPrompt = "You are an expert technical interviewer. You must provide a concise, high-quality, and structured ideal answer for the given interview question. Do not include any extra text, only the answer.";
        var userPrompt = $"Provide an ideal answer for this question for a {question.Session.JobRole} position:\n\nQuestion: {question.Text}";

        var idealAnswer = await _ollama.GenerateWithSystemAsync(systemPrompt, userPrompt);
        return idealAnswer.Trim();
    }

    private static string BuildSystemPrompt() =>
        "You are an expert technical interviewer. " +
        "You must ONLY output a raw JSON array with no extra text, no markdown, no code blocks, no explanation. " +
        "Start your response with [ and end with ].";

    private static string BuildUserPrompt(string jobRole, string resumeText, int count)
    {
        return $"Generate exactly {count} interview questions for a {jobRole} role.\n\n" +
               $"Candidate resume:\n{resumeText}\n\n" +
               "CRITICAL: Ensure the questions are highly diverse. Cover different projects, different technical skills, and different behavioral scenarios. DO NOT ask multiple questions about the same exact topic or skill.\n\n" +
               $"Output ONLY a JSON array of exactly {count} objects. " +
               "Each object must have these exact keys: text, category, difficulty. " +
               "category must be one of: Technical, Behavioral, Situational, SystemDesign. " +
               "difficulty must be one of: Easy, Medium, Hard. " +
               "Example of the required output format (your response must start with [ and end with ]):\n" +
               "[" +
               "{\"text\":\"Describe a time you optimized a slow database query.\",\"category\":\"Technical\",\"difficulty\":\"Medium\"}," +
               "{\"text\":\"Tell me about a conflict with a teammate.\",\"category\":\"Behavioral\",\"difficulty\":\"Easy\"}" +
               "]";
    }


    private List<AiQuestionItem> ParseQuestionsFromJson(string raw)
    {
        _logger.LogInformation("Parsing questions from raw string (length={Len}): {Preview}",
            raw.Length, raw[..Math.Min(300, raw.Length)]);

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        // Strategy 1: bare JSON array starting with [
        var arrStart = raw.IndexOf('[');
        var arrEnd   = raw.LastIndexOf(']');
        if (arrStart >= 0 && arrEnd > arrStart)
        {
            try
            {
                var jsonArray = raw[arrStart..(arrEnd + 1)];
                var result = JsonSerializer.Deserialize<List<AiQuestionItem>>(jsonArray, options);
                if (result is { Count: > 0 })
                {
                    _logger.LogInformation("Strategy 1 (bare array) succeeded: {Count} questions", result.Count);
                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Strategy 1 failed: {Msg}", ex.Message);
            }
        }

        // Strategy 2: JSON object wrapping the array e.g. {"questions":[...]}
        var objStart = raw.IndexOf('{');
        var objEnd   = raw.LastIndexOf('}');
        if (objStart >= 0 && objEnd > objStart)
        {
            try
            {
                var jsonObj = raw[objStart..(objEnd + 1)];
                using var doc = JsonDocument.Parse(jsonObj);
                foreach (var prop in doc.RootElement.EnumerateObject())
                {
                    if (prop.Value.ValueKind == JsonValueKind.Array)
                    {
                        var result = JsonSerializer.Deserialize<List<AiQuestionItem>>(prop.Value.GetRawText(), options);
                        if (result is { Count: > 0 })
                        {
                            _logger.LogInformation("Strategy 2 (wrapped object) succeeded: {Count} questions", result.Count);
                            return result;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Strategy 2 failed: {Msg}", ex.Message);
            }
        }

        throw new AppException($"AI returned an unparseable response. Raw output (first 500 chars): {raw[..Math.Min(500, raw.Length)]}");
    }

    private static QuestionCategory ParseCategory(string? cat) => cat?.ToLower() switch
    {
        "technical"    => QuestionCategory.Technical,
        "behavioral"   => QuestionCategory.Behavioral,
        "situational"  => QuestionCategory.Situational,
        "systemdesign" => QuestionCategory.SystemDesign,
        _              => QuestionCategory.Technical
    };

    private static QuestionDifficulty ParseDifficulty(string? diff) => diff?.ToLower() switch
    {
        "easy"   => QuestionDifficulty.Easy,
        "hard"   => QuestionDifficulty.Hard,
        _        => QuestionDifficulty.Medium
    };

    private static QuestionResponse MapToResponse(Question q) => new(
        q.Id, q.SessionId, q.Text,
        q.Category.ToString(), q.Difficulty.ToString(),
        q.OrderIndex, q.CreatedAt
    );
}
