using InterviewPrep.API.Models;

namespace InterviewPrep.API.DTOs.Answer;

public record SubmitTextAnswerRequest(
    Guid QuestionId,
    string Text
);

public record AnswerResponse(
    Guid Id,
    Guid QuestionId,
    string? Text,
    string? TranscribedText,
    AnswerType AnswerType,
    int AttemptNumber,
    DateTime SubmittedAt,
    FeedbackDto? Feedback
);

public record FeedbackDto(
    Guid Id,
    double Score,
    List<string> StrengthPoints,
    List<string> WeaknessPoints,
    string? Suggestions,
    string? IdealAnswerHint,
    string AIModel,
    DateTime GeneratedAt
);

public record GenerateFeedbackRequest(Guid AnswerId);
