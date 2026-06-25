using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public enum AnswerType
{
    Text,
    Voice
}

public class Answer
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid QuestionId { get; set; }

    public string? Text { get; set; }

    public string? AudioFilePath { get; set; }

    public string? TranscribedText { get; set; }

    public AnswerType AnswerType { get; set; } = AnswerType.Text;

    public int AttemptNumber { get; set; } = 1;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Question Question { get; set; } = null!;
    public Feedback? Feedback { get; set; }
}
