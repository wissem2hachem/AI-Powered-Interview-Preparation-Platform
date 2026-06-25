using InterviewPrep.API.Middleware;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    /// <summary>Get all progress snapshots for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetProgress()
    {
        var userId = HttpContext.GetUserId();
        var result = await _progressService.GetUserProgressAsync(userId);
        return Ok(result);
    }

    /// <summary>Get aggregated stats (totals, strongest/weakest categories, averages).</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = HttpContext.GetUserId();
        var result = await _progressService.GetUserStatsAsync(userId);
        return Ok(result);
    }
}
