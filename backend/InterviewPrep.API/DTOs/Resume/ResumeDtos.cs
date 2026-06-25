namespace InterviewPrep.API.DTOs.Resume;

public record ResumeUploadRequest(string? Description);

public record ResumeResponse(
    Guid Id,
    string FileName,
    long FileSizeBytes,
    bool HasParsedText,
    DateTime UploadedAt
);

public record ResumeDetailResponse(
    Guid Id,
    string FileName,
    long FileSizeBytes,
    string? ParsedText,
    DateTime UploadedAt
);
