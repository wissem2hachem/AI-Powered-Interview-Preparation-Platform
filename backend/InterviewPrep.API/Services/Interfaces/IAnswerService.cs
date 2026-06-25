using InterviewPrep.API.DTOs.Answer;

namespace InterviewPrep.API.Services.Interfaces;

public interface IAnswerService
{
    Task<AnswerResponse> SubmitTextAnswerAsync(Guid userId, SubmitTextAnswerRequest request);
    Task<AnswerResponse> SubmitVoiceAnswerAsync(Guid userId, Guid questionId, IFormFile audioFile);
    Task<AnswerResponse> GetAnswerWithFeedbackAsync(Guid userId, Guid answerId);
    Task<FeedbackDto> GenerateFeedbackAsync(Guid userId, Guid answerId);
}
