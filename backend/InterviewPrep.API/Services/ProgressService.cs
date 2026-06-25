using System.Text.Json;
using InterviewPrep.API.Data;
using InterviewPrep.API.DTOs.Progress;
using InterviewPrep.API.Models;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Services;

public class ProgressService : IProgressService
{
    private readonly AppDbContext _db;

    public ProgressService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProgressSnapshotResponse>> GetUserProgressAsync(Guid userId)
    {
        var snapshots = await _db.ProgressSnapshots
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.Date)
            .Take(50)
            .ToListAsync();

        return snapshots.Select(MapToResponse).ToList();
    }

    public async Task<ProgressStatsResponse> GetUserStatsAsync(Guid userId)
    {
        var sessions = await _db.InterviewSessions
            .Where(s => s.UserId == userId)
            .ToListAsync();

        var snapshots = await _db.ProgressSnapshots
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.Date)
            .ToListAsync();

        var totalSessions = sessions.Count;
        var completedSessions = sessions.Count(s => s.Status == SessionStatus.Completed);

        var allScores = snapshots.Select(s => s.AverageScore).ToList();
        var overallAvg = allScores.Count > 0 ? Math.Round(allScores.Average(), 2) : 0;

        var totalAnswered = snapshots.Sum(s => s.AnsweredQuestions);

        // Aggregate category scores
        var categoryTotals = new Dictionary<string, (double sum, int count)>();
        foreach (var snap in snapshots)
        {
            if (string.IsNullOrEmpty(snap.CategoryScores)) continue;
            try
            {
                var cats = JsonSerializer.Deserialize<Dictionary<string, double>>(snap.CategoryScores);
                if (cats == null) continue;
                foreach (var (k, v) in cats)
                {
                    if (!categoryTotals.ContainsKey(k))
                        categoryTotals[k] = (0, 0);
                    categoryTotals[k] = (categoryTotals[k].sum + v, categoryTotals[k].count + 1);
                }
            }
            catch { /* ignore parse errors */ }
        }

        var categoryAverages = categoryTotals
            .ToDictionary(k => k.Key, k => Math.Round(k.Value.sum / k.Value.count, 2));

        var strongest = categoryAverages.Count > 0
            ? categoryAverages.MaxBy(k => k.Value).Key : null;
        var weakest = categoryAverages.Count > 0
            ? categoryAverages.MinBy(k => k.Value).Key : null;

        var avgByRole = snapshots
            .GroupBy(s => s.JobRole)
            .ToDictionary(
                g => g.Key,
                g => Math.Round(g.Average(s => s.AverageScore), 2)
            );

        return new ProgressStatsResponse(
            totalSessions,
            completedSessions,
            totalAnswered,
            overallAvg,
            strongest,
            weakest,
            avgByRole,
            snapshots.Take(10).Select(MapToResponse).ToList()
        );
    }

    private static ProgressSnapshotResponse MapToResponse(ProgressSnapshot p)
    {
        Dictionary<string, double>? cats = null;
        if (!string.IsNullOrEmpty(p.CategoryScores))
        {
            try { cats = JsonSerializer.Deserialize<Dictionary<string, double>>(p.CategoryScores); }
            catch { /* ignore */ }
        }

        return new ProgressSnapshotResponse(
            p.Id, p.SessionId, p.JobRole,
            p.AverageScore, p.TotalQuestions,
            p.AnsweredQuestions, cats, p.Date
        );
    }
}
