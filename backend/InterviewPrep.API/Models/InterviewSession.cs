using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public enum SessionStatus
{
    InProgress,
    Completed,
    Abandoned
}

public class InterviewSession
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid ResumeId { get; set; }

    [Required, MaxLength(100)]
    public string JobRole { get; set; } = string.Empty;

    [MaxLength(50)]
    public string AIModel { get; set; } = "qwen3:4b";

    public SessionStatus Status { get; set; } = SessionStatus.InProgress;

    public int TotalQuestions { get; set; }

    public double? AverageScore { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Resume Resume { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = [];
    public ProgressSnapshot? ProgressSnapshot { get; set; }
}
