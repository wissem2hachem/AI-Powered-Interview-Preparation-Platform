namespace InterviewPrep.API.DTOs.Auth;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    DateTime CreatedAt
);

public record RefreshTokenRequest(string RefreshToken);
