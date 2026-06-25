namespace InterviewPrep.API.DTOs.Progress;

public record ProgressSnapshotResponse(
    Guid Id,
    Guid SessionId,
    string JobRole,
    double AverageScore,
    int TotalQuestions,
    int AnsweredQuestions,
    Dictionary<string, double>? CategoryScores,
    DateTime Date
);

public record ProgressStatsResponse(
    int TotalSessions,
    int CompletedSessions,
    int TotalQuestionsAnswered,
    double OverallAverageScore,
    string? StrongestCategory,
    string? WeakestCategory,
    Dictionary<string, double> AverageScoreByRole,
    List<ProgressSnapshotResponse> RecentSnapshots
);
