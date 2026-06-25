using InterviewPrep.API.DTOs.Session;

namespace InterviewPrep.API.Services.Interfaces;

public interface ISessionService
{
    Task<SessionResponse> CreateSessionAsync(Guid userId, CreateSessionRequest request);
    Task<List<SessionResponse>> GetUserSessionsAsync(Guid userId);
    Task<SessionDetailResponse> GetSessionDetailAsync(Guid userId, Guid sessionId);
    Task<SessionResponse> CompleteSessionAsync(Guid userId, Guid sessionId);
    Task DeleteSessionAsync(Guid userId, Guid sessionId);
}
