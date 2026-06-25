using System.Security.Claims;

namespace InterviewPrep.API.Middleware;

public static class HttpContextExtensions
{
    public static Guid GetUserId(this HttpContext context)
    {
        var claim = context.User.FindFirst(ClaimTypes.NameIdentifier)
                    ?? context.User.FindFirst("sub");

        if (claim is null || !Guid.TryParse(claim.Value, out var userId))
            throw new Exceptions.UnauthorizedException("User identity not found in token.");

        return userId;
    }
}
