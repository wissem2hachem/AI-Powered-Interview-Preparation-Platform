using InterviewPrep.API.Data;
using InterviewPrep.API.DTOs.Resume;
using InterviewPrep.API.Exceptions;
using InterviewPrep.API.Models;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Services;

public class ResumeService : IResumeService
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;
    private readonly ResumeParserService _parser;
    private readonly IWebHostEnvironment _env;

    private static readonly string[] AllowedExtensions = [".pdf", ".txt", ".docx"];
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public ResumeService(
        AppDbContext db,
        IStorageService storage,
        ResumeParserService parser,
        IWebHostEnvironment env)
    {
        _db = db;
        _storage = storage;
        _parser = parser;
        _env = env;
    }

    public async Task<ResumeResponse> UploadResumeAsync(Guid userId, IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(ext))
            throw new ValidationException("file", $"File type '{ext}' is not supported. Allowed: {string.Join(", ", AllowedExtensions)}");

        if (file.Length > MaxFileSizeBytes)
            throw new ValidationException("file", "File size exceeds the 10 MB limit.");

        // Save file
        var relativePath = await _storage.SaveFileAsync(file, $"resumes/{userId}");

        // Parse text
        string? parsedText = null;
        if (ext == ".pdf")
        {
            var fullPath = Path.Combine(_env.ContentRootPath, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
            parsedText = _parser.ExtractTextFromPdf(fullPath);
        }

        var resume = new Resume
        {
            UserId       = userId,
            FileName     = file.FileName,
            FilePath     = relativePath,
            ParsedText   = parsedText,
            FileSizeBytes = file.Length
        };

        _db.Resumes.Add(resume);
        await _db.SaveChangesAsync();

        return MapToResponse(resume);
    }

    public async Task<List<ResumeResponse>> GetUserResumesAsync(Guid userId)
    {
        var resumes = await _db.Resumes
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.UploadedAt)
            .ToListAsync();

        return resumes.Select(MapToResponse).ToList();
    }

    public async Task<ResumeDetailResponse> GetResumeDetailAsync(Guid userId, Guid resumeId)
    {
        var resume = await _db.Resumes
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userId)
            ?? throw new NotFoundException("Resume", resumeId);

        return new ResumeDetailResponse(
            resume.Id,
            resume.FileName,
            resume.FileSizeBytes,
            resume.ParsedText,
            resume.UploadedAt
        );
    }

    public async Task DeleteResumeAsync(Guid userId, Guid resumeId)
    {
        var resume = await _db.Resumes
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userId)
            ?? throw new NotFoundException("Resume", resumeId);

        await _storage.DeleteFileAsync(resume.FilePath);
        _db.Resumes.Remove(resume);
        await _db.SaveChangesAsync();
    }

    private static ResumeResponse MapToResponse(Resume r) => new(
        r.Id, r.FileName, r.FileSizeBytes,
        !string.IsNullOrEmpty(r.ParsedText),
        r.UploadedAt
    );
}
