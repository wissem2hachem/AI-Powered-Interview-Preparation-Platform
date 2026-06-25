using InterviewPrep.API.DTOs.Session;
using InterviewPrep.API.Middleware;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    /// <summary>Create a new interview session.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionRequest request)
    {
        var userId = HttpContext.GetUserId();
        var result = await _sessionService.CreateSessionAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>List all sessions for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = HttpContext.GetUserId();
        var result = await _sessionService.GetUserSessionsAsync(userId);
        return Ok(result);
    }

    /// <summary>Get full session details including questions.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = HttpContext.GetUserId();
        var result = await _sessionService.GetSessionDetailAsync(userId, id);
        return Ok(result);
    }

    /// <summary>Mark a session as completed and calculate final scores.</summary>
    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var userId = HttpContext.GetUserId();
        var result = await _sessionService.CompleteSessionAsync(userId, id);
        return Ok(result);
    }

    /// <summary>Delete a session and all its data.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = HttpContext.GetUserId();
        await _sessionService.DeleteSessionAsync(userId, id);
        return NoContent();
    }
}
