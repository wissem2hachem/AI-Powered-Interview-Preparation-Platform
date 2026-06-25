using InterviewPrep.API.Models;

namespace InterviewPrep.API.DTOs.Question;

public record GenerateQuestionsRequest(
    Guid SessionId,
    int Count = 8
);

public record QuestionResponse(
    Guid Id,
    Guid SessionId,
    string Text,
    string Category,
    string Difficulty,
    int OrderIndex,
    DateTime CreatedAt
);

public record AiQuestionItem(
    string text,
    string category,
    string difficulty
);
