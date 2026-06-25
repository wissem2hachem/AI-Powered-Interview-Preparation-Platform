using InterviewPrep.API.DTOs.Question;
using InterviewPrep.API.Middleware;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    /// <summary>Get all questions for a session.</summary>
    [HttpGet("sessions/{sessionId:guid}/questions")]
    public async Task<IActionResult> GetBySession(Guid sessionId)
    {
        var userId = HttpContext.GetUserId();
        var result = await _questionService.GetSessionQuestionsAsync(userId, sessionId);
        return Ok(result);
    }

    /// <summary>Generate an ideal answer for a specific question.</summary>
    [HttpGet("questions/{id:guid}/ideal-answer")]
    public async Task<IActionResult> GetIdealAnswer(Guid id)
    {
        var userId = HttpContext.GetUserId();
        var result = await _questionService.GetIdealAnswerAsync(userId, id);
        return Ok(new { text = result });
    }

    /// <summary>Generate AI questions for a session using the resume and job role.</summary>
    [HttpPost("sessions/{sessionId:guid}/questions/generate")]
    public async Task<IActionResult> Generate(Guid sessionId, [FromQuery] int count = 8)
    {
        var userId = HttpContext.GetUserId();
        var request = new GenerateQuestionsRequest(sessionId, count);
        var result = await _questionService.GenerateQuestionsAsync(userId, request);
        return Ok(result);
    }
}
