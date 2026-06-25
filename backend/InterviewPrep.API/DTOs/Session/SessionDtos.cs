using InterviewPrep.API.Models;

namespace InterviewPrep.API.DTOs.Session;

public record CreateSessionRequest(
    Guid ResumeId,
    string JobRole,
    string AIModel = "qwen3:4b",
    int QuestionCount = 8
);

public record SessionResponse(
    Guid Id,
    Guid ResumeId,
    string ResumeFileName,
    string JobRole,
    string AIModel,
    SessionStatus Status,
    int TotalQuestions,
    double? AverageScore,
    DateTime StartedAt,
    DateTime? CompletedAt
);

public record SessionDetailResponse(
    Guid Id,
    Guid ResumeId,
    string ResumeFileName,
    string JobRole,
    string AIModel,
    SessionStatus Status,
    int TotalQuestions,
    double? AverageScore,
    DateTime StartedAt,
    DateTime? CompletedAt,
    List<QuestionSummaryDto> Questions
);

public record QuestionSummaryDto(
    Guid Id,
    string Text,
    string Category,
    string Difficulty,
    int OrderIndex,
    bool HasAnswer
);

public record CompleteSessionRequest(Guid SessionId);
