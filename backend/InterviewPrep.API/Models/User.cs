using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Resume> Resumes { get; set; } = [];
    public ICollection<InterviewSession> Sessions { get; set; } = [];
    public ICollection<ProgressSnapshot> ProgressSnapshots { get; set; } = [];
}
