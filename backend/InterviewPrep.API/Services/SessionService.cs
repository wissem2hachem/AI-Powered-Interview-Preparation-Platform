using InterviewPrep.API.Data;
using InterviewPrep.API.DTOs.Session;
using InterviewPrep.API.Exceptions;
using InterviewPrep.API.Models;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Services;

public class SessionService : ISessionService
{
    private readonly AppDbContext _db;

    public SessionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SessionResponse> CreateSessionAsync(Guid userId, CreateSessionRequest request)
    {
        var resume = await _db.Resumes
            .FirstOrDefaultAsync(r => r.Id == request.ResumeId && r.UserId == userId)
            ?? throw new NotFoundException("Resume", request.ResumeId);

        var session = new InterviewSession
        {
            UserId   = userId,
            ResumeId = request.ResumeId,
            JobRole  = request.JobRole.Trim(),
            AIModel  = request.AIModel,
            Status   = SessionStatus.InProgress,
            TotalQuestions = request.QuestionCount
        };

        _db.InterviewSessions.Add(session);
        await _db.SaveChangesAsync();

        return MapToResponse(session, resume.FileName);
    }

    public async Task<List<SessionResponse>> GetUserSessionsAsync(Guid userId)
    {
        var sessions = await _db.InterviewSessions
            .Include(s => s.Resume)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();

        return sessions.Select(s => MapToResponse(s, s.Resume.FileName)).ToList();
    }

    public async Task<SessionDetailResponse> GetSessionDetailAsync(Guid userId, Guid sessionId)
    {
        var session = await _db.InterviewSessions
            .Include(s => s.Resume)
            .Include(s => s.Questions)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
            ?? throw new NotFoundException("Session", sessionId);

        var questionSummaries = session.Questions
            .OrderBy(q => q.OrderIndex)
            .Select(q => new QuestionSummaryDto(
                q.Id,
                q.Text,
                q.Category.ToString(),
                q.Difficulty.ToString(),
                q.OrderIndex,
                q.Answers.Any()
            )).ToList();

        return new SessionDetailResponse(
            session.Id,
            session.ResumeId,
            session.Resume.FileName,
            session.JobRole,
            session.AIModel,
            session.Status,
            session.TotalQuestions,
            session.AverageScore,
            session.StartedAt,
            session.CompletedAt,
            questionSummaries
        );
    }

    public async Task<SessionResponse> CompleteSessionAsync(Guid userId, Guid sessionId)
    {
        var session = await _db.InterviewSessions
            .Include(s => s.Resume)
            .Include(s => s.Questions)
                .ThenInclude(q => q.Answers)
                    .ThenInclude(a => a.Feedback)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
            ?? throw new NotFoundException("Session", sessionId);

        if (session.Status == SessionStatus.Completed)
            throw new AppException("Session is already completed.", 400);

        // Calculate average score from all feedbacks
        var scores = session.Questions
            .SelectMany(q => q.Answers)
            .Where(a => a.Feedback != null)
            .Select(a => a.Feedback!.Score)
            .ToList();

        session.AverageScore = scores.Count > 0 ? Math.Round(scores.Average(), 2) : null;
        session.Status = SessionStatus.Completed;
        session.CompletedAt = DateTime.UtcNow;

        // Save progress snapshot
        if (scores.Count > 0)
        {
            var categoryScores = session.Questions
                .GroupBy(q => q.Category.ToString())
                .ToDictionary(
                    g => g.Key,
                    g => g.SelectMany(q => q.Answers)
                           .Where(a => a.Feedback != null)
                           .Select(a => a.Feedback!.Score)
                           .DefaultIfEmpty(0)
                           .Average()
                );

            var snapshot = new ProgressSnapshot
            {
                UserId            = userId,
                SessionId         = sessionId,
                JobRole           = session.JobRole,
                AverageScore      = session.AverageScore ?? 0,
                TotalQuestions    = session.Questions.Count,
                AnsweredQuestions = session.Questions.Count(q => q.Answers.Any()),
                CategoryScores    = System.Text.Json.JsonSerializer.Serialize(categoryScores),
                Date              = DateTime.UtcNow
            };

            _db.ProgressSnapshots.Add(snapshot);
        }

        await _db.SaveChangesAsync();

        return MapToResponse(session, session.Resume.FileName);
    }

    public async Task DeleteSessionAsync(Guid userId, Guid sessionId)
    {
        var session = await _db.InterviewSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
            ?? throw new NotFoundException("Session", sessionId);

        _db.InterviewSessions.Remove(session);
        await _db.SaveChangesAsync();
    }

    private static SessionResponse MapToResponse(InterviewSession s, string fileName) => new(
        s.Id, s.ResumeId, fileName, s.JobRole, s.AIModel,
        s.Status, s.TotalQuestions, s.AverageScore,
        s.StartedAt, s.CompletedAt
    );
}
