using InterviewPrep.API.DTOs.Resume;

namespace InterviewPrep.API.Services.Interfaces;

public interface IResumeService
{
    Task<ResumeResponse> UploadResumeAsync(Guid userId, IFormFile file);
    Task<List<ResumeResponse>> GetUserResumesAsync(Guid userId);
    Task<ResumeDetailResponse> GetResumeDetailAsync(Guid userId, Guid resumeId);
    Task DeleteResumeAsync(Guid userId, Guid resumeId);
}
