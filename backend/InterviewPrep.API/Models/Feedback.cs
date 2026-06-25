using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public class Feedback
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AnswerId { get; set; }

    [Range(0, 10)]
    public double Score { get; set; }

    public string? StrengthPoints { get; set; }   // JSON array stored as string

    public string? WeaknessPoints { get; set; }   // JSON array stored as string

    public string? Suggestions { get; set; }

    public string? IdealAnswerHint { get; set; }

    [MaxLength(50)]
    public string AIModel { get; set; } = "qwen3:4b";

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Answer Answer { get; set; } = null!;
}
