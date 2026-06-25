using Microsoft.EntityFrameworkCore;
using InterviewPrep.API.Models;

namespace InterviewPrep.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<InterviewSession> InterviewSessions => Set<InterviewSession>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<ProgressSnapshot> ProgressSnapshots => Set<ProgressSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            e.Property(u => u.LastName).IsRequired().HasMaxLength(100);
        });

        // Resume
        modelBuilder.Entity<Resume>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.User)
             .WithMany(u => u.Resumes)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // InterviewSession
        modelBuilder.Entity<InterviewSession>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Status).HasConversion<string>();
            e.HasOne(s => s.User)
             .WithMany(u => u.Sessions)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Resume)
             .WithMany(r => r.Sessions)
             .HasForeignKey(s => s.ResumeId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Question
        modelBuilder.Entity<Question>(e =>
        {
            e.HasKey(q => q.Id);
            e.Property(q => q.Category).HasConversion<string>();
            e.Property(q => q.Difficulty).HasConversion<string>();
            e.HasOne(q => q.Session)
             .WithMany(s => s.Questions)
             .HasForeignKey(q => q.SessionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Answer
        modelBuilder.Entity<Answer>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.AnswerType).HasConversion<string>();
            e.HasOne(a => a.Question)
             .WithMany(q => q.Answers)
             .HasForeignKey(a => a.QuestionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Feedback
        modelBuilder.Entity<Feedback>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasOne(f => f.Answer)
             .WithOne(a => a.Feedback)
             .HasForeignKey<Feedback>(f => f.AnswerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ProgressSnapshot
        modelBuilder.Entity<ProgressSnapshot>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.User)
             .WithMany(u => u.ProgressSnapshots)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Session)
             .WithOne(s => s.ProgressSnapshot)
             .HasForeignKey<ProgressSnapshot>(p => p.SessionId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
