using InterviewPrep.API.DTOs.Progress;

namespace InterviewPrep.API.Services.Interfaces;

public interface IProgressService
{
    Task<List<ProgressSnapshotResponse>> GetUserProgressAsync(Guid userId);
    Task<ProgressStatsResponse> GetUserStatsAsync(Guid userId);
}
