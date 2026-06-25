using InterviewPrep.API.DTOs.Answer;
using InterviewPrep.API.Middleware;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers;

[ApiController]
[Route("api/answers")]
[Authorize]
public class AnswersController : ControllerBase
{
    private readonly IAnswerService _answerService;

    public AnswersController(IAnswerService answerService)
    {
        _answerService = answerService;
    }

    /// <summary>Submit a text answer for a question.</summary>
    [HttpPost("text")]
    public async Task<IActionResult> SubmitText([FromBody] SubmitTextAnswerRequest request)
    {
        var userId = HttpContext.GetUserId();
        var result = await _answerService.SubmitTextAnswerAsync(userId, request);
        return Ok(result);
    }

    /// <summary>Submit a voice answer (audio file) for a question.</summary>
    [HttpPost("voice")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> SubmitVoice([FromForm] Guid questionId, IFormFile audio)
    {
        var userId = HttpContext.GetUserId();
        var result = await _answerService.SubmitVoiceAnswerAsync(userId, questionId, audio);
        return Ok(result);
    }

    /// <summary>Get an answer including its feedback.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = HttpContext.GetUserId();
        var result = await _answerService.GetAnswerWithFeedbackAsync(userId, id);
        return Ok(result);
    }

    /// <summary>Generate AI feedback and score for an answer.</summary>
    [HttpPost("{id:guid}/feedback")]
    public async Task<IActionResult> GenerateFeedback(Guid id)
    {
        var userId = HttpContext.GetUserId();
        var result = await _answerService.GenerateFeedbackAsync(userId, id);
        return Ok(result);
    }
}
