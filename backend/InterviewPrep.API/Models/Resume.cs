using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public class Resume
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required, MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public string FilePath { get; set; } = string.Empty;

    public string? ParsedText { get; set; }

    public long FileSizeBytes { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<InterviewSession> Sessions { get; set; } = [];
}
