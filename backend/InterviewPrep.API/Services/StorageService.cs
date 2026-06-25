using InterviewPrep.API.Services.Interfaces;

namespace InterviewPrep.API.Services;

public class StorageService : IStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<StorageService> _logger;
    private readonly string _baseUploadPath;

    public StorageService(IWebHostEnvironment env, ILogger<StorageService> logger)
    {
        _env = env;
        _logger = logger;
        _baseUploadPath = Path.Combine(_env.ContentRootPath, "Uploads");
        Directory.CreateDirectory(_baseUploadPath);
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subfolder)
    {
        var folderPath = Path.Combine(_baseUploadPath, subfolder);
        Directory.CreateDirectory(folderPath);

        var safeFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(folderPath, safeFileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        _logger.LogInformation("Saved file to {FilePath}", filePath);

        // Return relative path for storage in DB
        return Path.Combine("Uploads", subfolder, safeFileName).Replace("\\", "/");
    }

    public Task DeleteFileAsync(string relativeFilePath)
    {
        var fullPath = Path.Combine(_env.ContentRootPath, relativeFilePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Deleted file: {FilePath}", fullPath);
        }

        return Task.CompletedTask;
    }

    public string GetFileUrl(string filePath) => $"/files/{filePath.Replace("Uploads/", "")}";
}
