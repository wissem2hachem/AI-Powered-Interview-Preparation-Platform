using System.Text.Json;
using InterviewPrep.API.Data;
using InterviewPrep.API.DTOs.Answer;
using InterviewPrep.API.Exceptions;
using InterviewPrep.API.Models;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Services;

public class AnswerService : IAnswerService
{
    private readonly AppDbContext _db;
    private readonly IOllamaService _ollama;
    private readonly IStorageService _storage;
    private readonly ILogger<AnswerService> _logger;

    public AnswerService(
        AppDbContext db,
        IOllamaService ollama,
        IStorageService storage,
        ILogger<AnswerService> logger)
    {
        _db = db;
        _ollama = ollama;
        _storage = storage;
        _logger = logger;
    }

    public async Task<AnswerResponse> SubmitTextAnswerAsync(Guid userId, SubmitTextAnswerRequest request)
    {
        var question = await GetQuestionForUserAsync(userId, request.QuestionId);

        if (string.IsNullOrWhiteSpace(request.Text))
            throw new ValidationException("text", "Answer text cannot be empty.");

        var attemptNumber = await _db.Answers.CountAsync(a => a.QuestionId == request.QuestionId) + 1;

        var answer = new Answer
        {
            QuestionId    = request.QuestionId,
            Text          = request.Text.Trim(),
            AnswerType    = AnswerType.Text,
            AttemptNumber = attemptNumber
        };

        _db.Answers.Add(answer);
        await _db.SaveChangesAsync();

        return MapToResponse(answer, null);
    }

    public async Task<AnswerResponse> SubmitVoiceAnswerAsync(Guid userId, Guid questionId, IFormFile audioFile)
    {
        var question = await GetQuestionForUserAsync(userId, questionId);

        if (audioFile.Length == 0)
            throw new ValidationException("audio", "Audio file is empty.");

        var relativePath = await _storage.SaveFileAsync(audioFile, $"audio/{userId}");
        var attemptNumber = await _db.Answers.CountAsync(a => a.QuestionId == questionId) + 1;

        var answer = new Answer
        {
            QuestionId    = questionId,
            AudioFilePath = relativePath,
            AnswerType    = AnswerType.Voice,
            AttemptNumber = attemptNumber
            // TranscribedText could be set here if STT is integrated
        };

        _db.Answers.Add(answer);
        await _db.SaveChangesAsync();

        return MapToResponse(answer, null);
    }

    public async Task<AnswerResponse> GetAnswerWithFeedbackAsync(Guid userId, Guid answerId)
    {
        var answer = await GetAnswerForUserAsync(userId, answerId);
        return MapToResponse(answer, answer.Feedback);
    }

    public async Task<FeedbackDto> GenerateFeedbackAsync(Guid userId, Guid answerId)
    {
        var answer = await GetAnswerForUserAsync(userId, answerId);

        if (answer.Feedback != null)
            return MapFeedbackToDto(answer.Feedback);

        var question   = answer.Question;
        var session    = question.Session;
        var answerText = answer.Text ?? answer.TranscribedText ?? "[No text answer provided]";

        var systemPrompt = BuildFeedbackSystemPrompt();
        var userPrompt   = BuildFeedbackUserPrompt(question.Text, answerText, session.JobRole);

        var rawJson = await _ollama.GenerateWithSystemAsync(systemPrompt, userPrompt);
        var feedbackData = ParseFeedbackFromJson(rawJson);

        var feedback = new Feedback
        {
            AnswerId        = answerId,
            Score           = feedbackData.score,
            StrengthPoints  = JsonSerializer.Serialize(feedbackData.strengths ?? []),
            WeaknessPoints  = JsonSerializer.Serialize(feedbackData.weaknesses ?? []),
            Suggestions     = feedbackData.suggestions,
            IdealAnswerHint = feedbackData.ideal_answer_hint,
            AIModel         = session.AIModel
        };

        _db.Feedbacks.Add(feedback);
        await _db.SaveChangesAsync();

        return MapFeedbackToDto(feedback);
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private async Task<Question> GetQuestionForUserAsync(Guid userId, Guid questionId)
    {
        var question = await _db.Questions
            .Include(q => q.Session)
            .FirstOrDefaultAsync(q => q.Id == questionId)
            ?? throw new NotFoundException("Question", questionId);

        if (question.Session.UserId != userId)
            throw new UnauthorizedException();

        return question;
    }

    private async Task<Answer> GetAnswerForUserAsync(Guid userId, Guid answerId)
    {
        var answer = await _db.Answers
            .Include(a => a.Question)
                .ThenInclude(q => q.Session)
            .Include(a => a.Feedback)
            .FirstOrDefaultAsync(a => a.Id == answerId)
            ?? throw new NotFoundException("Answer", answerId);

        if (answer.Question.Session.UserId != userId)
            throw new UnauthorizedException();

        return answer;
    }

    private static string BuildFeedbackSystemPrompt() => """
        You are an expert technical interviewer evaluating a candidate's interview answer.
        Analyze the answer thoroughly and provide structured, constructive feedback.
        Always respond with ONLY a valid JSON object — no markdown, no explanation, no extra text.
        """;

    private static string BuildFeedbackUserPrompt(string question, string answer, string jobRole)
    {
        return $"Evaluate this interview answer for a {jobRole} position.\n\n" +
               $"Question: {question}\n\n" +
               $"Candidate's Answer: {answer}\n\n" +
               "Return ONLY a JSON object in this exact format:\n" +
               "{\n" +
               "  \"score\": 7.5,\n" +
               "  \"strengths\": [\"Clear explanation\", \"Good use of examples\"],\n" +
               "  \"weaknesses\": [\"Could mention edge cases\", \"Lacked depth on X\"],\n" +
               "  \"suggestions\": \"Consider elaborating on ... You could improve by ...\"\n" +
               "}\n\n" +
               "Score must be a number between 0 and 10.";
    }

    private FeedbackResult ParseFeedbackFromJson(string raw)
    {
        try
        {
            var start = raw.IndexOf('{');
            var end   = raw.LastIndexOf('}');

            if (start < 0 || end < 0 || end <= start)
            {
                _logger.LogWarning("No JSON object in feedback response");
                return new FeedbackResult(5, [], [], "Unable to parse AI feedback.", null);
            }

            var jsonStr = raw[start..(end + 1)];
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<FeedbackResult>(jsonStr, options)
                   ?? new FeedbackResult(5, [], [], null, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse feedback JSON");
            return new FeedbackResult(5, [], [], "Could not parse AI feedback.", null);
        }
    }

    private static AnswerResponse MapToResponse(Answer a, Feedback? feedback) => new(
        a.Id, a.QuestionId,
        a.Text, a.TranscribedText,
        a.AnswerType, a.AttemptNumber, a.SubmittedAt,
        feedback != null ? MapFeedbackToDto(feedback) : null
    );

    private static FeedbackDto MapFeedbackToDto(Feedback f) => new(
        f.Id,
        f.Score,
        ParseJsonStringList(f.StrengthPoints),
        ParseJsonStringList(f.WeaknessPoints),
        f.Suggestions,
        f.IdealAnswerHint,
        f.AIModel,
        f.GeneratedAt
    );

    private static List<string> ParseJsonStringList(string? json)
    {
        if (string.IsNullOrEmpty(json)) return [];
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return []; }
    }

    private record FeedbackResult(
        double score,
        List<string>? strengths,
        List<string>? weaknesses,
        string? suggestions,
        string? ideal_answer_hint
    );
}
