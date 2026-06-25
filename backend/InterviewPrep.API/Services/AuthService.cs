using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InterviewPrep.API.Data;
using InterviewPrep.API.DTOs.Auth;
using InterviewPrep.API.Exceptions;
using InterviewPrep.API.Models;
using InterviewPrep.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace InterviewPrep.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
            throw new ConflictException($"An account with email '{request.Email}' already exists.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            throw new ValidationException("password", "Password must be at least 8 characters.");

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName  = request.LastName.Trim(),
            Email     = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower())
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        return BuildAuthResponse(user);
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var jwtSettings   = _config.GetSection("Jwt");
        var secretKey     = jwtSettings["SecretKey"]!;
        var issuer        = jwtSettings["Issuer"]!;
        var audience      = jwtSettings["Audience"]!;
        var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "1440");

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:   issuer,
            audience: audience,
            claims:   claims,
            expires:  expiry,
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResponse(
            Token:        tokenString,
            RefreshToken: Guid.NewGuid().ToString("N"),
            ExpiresAt:    expiry,
            User: new UserDto(
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.CreatedAt
            )
        );
    }
}
