using InterviewPrep.API.Middleware;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers;

[ApiController]
[Route("api/resumes")]
[Authorize]
public class ResumesController : ControllerBase
{
    private readonly IResumeService _resumeService;

    public ResumesController(IResumeService resumeService)
    {
        _resumeService = resumeService;
    }

    /// <summary>Upload a resume (PDF). Max 10 MB.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var userId = HttpContext.GetUserId();
        var result = await _resumeService.UploadResumeAsync(userId, file);
        return Ok(result);
    }

    /// <summary>List all resumes for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = HttpContext.GetUserId();
        var result = await _resumeService.GetUserResumesAsync(userId);
        return Ok(result);
    }

    /// <summary>Get full details of a specific resume.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = HttpContext.GetUserId();
        var result = await _resumeService.GetResumeDetailAsync(userId, id);
        return Ok(result);
    }

    /// <summary>Delete a resume.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = HttpContext.GetUserId();
        await _resumeService.DeleteResumeAsync(userId, id);
        return NoContent();
    }
}
