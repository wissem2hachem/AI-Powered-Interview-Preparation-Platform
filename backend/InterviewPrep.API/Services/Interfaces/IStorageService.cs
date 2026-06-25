namespace InterviewPrep.API.Services.Interfaces;

public interface IStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string subfolder);
    Task DeleteFileAsync(string filePath);
    string GetFileUrl(string filePath);
}
