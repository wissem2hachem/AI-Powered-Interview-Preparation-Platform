using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public class ProgressSnapshot
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid SessionId { get; set; }

    [Required, MaxLength(100)]
    public string JobRole { get; set; } = string.Empty;

    public double AverageScore { get; set; }

    public int TotalQuestions { get; set; }

    public int AnsweredQuestions { get; set; }

    public string? CategoryScores { get; set; }  // JSON: { "Technical": 7.5, "Behavioral": 6.0 }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public InterviewSession Session { get; set; } = null!;
}
