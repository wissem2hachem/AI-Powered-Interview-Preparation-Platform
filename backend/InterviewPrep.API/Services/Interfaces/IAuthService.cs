using InterviewPrep.API.DTOs.Auth;

namespace InterviewPrep.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
