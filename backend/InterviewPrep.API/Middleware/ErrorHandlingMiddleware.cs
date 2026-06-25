using System.Net;
using System.Text.Json;
using InterviewPrep.API.Exceptions;
using AppValidationException = InterviewPrep.API.Exceptions.ValidationException;

namespace InterviewPrep.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        object response;

        switch (exception)
        {
            case AppValidationException validationEx:
                context.Response.StatusCode = validationEx.StatusCode;
                response = new
                {
                    statusCode = validationEx.StatusCode,
                    message = validationEx.Message,
                    errors = validationEx.Errors
                };
                break;

            case AppException appEx:
                context.Response.StatusCode = appEx.StatusCode;
                response = new
                {
                    statusCode = appEx.StatusCode,
                    message = appEx.Message
                };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new
                {
                    statusCode = 500,
                    message = "An unexpected error occurred. Please try again later."
                };
                break;
        }

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}

public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ErrorHandlingMiddleware>();
}
