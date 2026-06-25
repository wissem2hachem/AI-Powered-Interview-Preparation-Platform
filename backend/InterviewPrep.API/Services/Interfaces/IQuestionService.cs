using InterviewPrep.API.DTOs.Question;

namespace InterviewPrep.API.Services.Interfaces;

public interface IQuestionService
{
    Task<List<QuestionResponse>> GenerateQuestionsAsync(Guid userId, GenerateQuestionsRequest request);
    Task<List<QuestionResponse>> GetSessionQuestionsAsync(Guid userId, Guid sessionId);
    Task<string> GetIdealAnswerAsync(Guid userId, Guid questionId);
}
