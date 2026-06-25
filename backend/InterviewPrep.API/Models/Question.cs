using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public enum QuestionCategory
{
    Technical,
    Behavioral,
    Situational,
    SystemDesign
}

public enum QuestionDifficulty
{
    Easy,
    Medium,
    Hard
}

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid SessionId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    public QuestionCategory Category { get; set; } = QuestionCategory.Technical;

    public QuestionDifficulty Difficulty { get; set; } = QuestionDifficulty.Medium;

    public int OrderIndex { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public InterviewSession Session { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = [];
}
