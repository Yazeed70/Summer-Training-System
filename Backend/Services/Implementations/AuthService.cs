using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using summer_training_app.Common.Constants;
using summer_training_app.Common.Results;
using summer_training_app.Data;
using summer_training_app.DTOs.Auth;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly SummerTrainingDBContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(SummerTrainingDBContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<Result<string>> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.StudentProfile)
                .Include(u => u.CollegeRepresentative)
                .Include(u => u.CompanyRepresentative)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "User not found.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "Username or password is incorrect.");
            }

            if (!user.IsActive)
            {
                return Error.Unauthorized(ErrorCodes.UserInactive, "User is inactive.");
            }

            var token = GenerateJwtToken(user);
            return token;
        }

        public async Task<Result<string>> RegisterAsync(RegisterRequestDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return Error.Conflict(ErrorCodes.UserAlreadyExists, "Username already exists.");
            }

            var basicUserRole = await _context.Roles.FirstOrDefaultAsync(r => r.Id == (byte)enRoles.BasicUser);
            if (basicUserRole == null)
            {
                return Error.NotFound(ErrorCodes.RoleNotFound, "Role not found.");
            }

            string hashPassword = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password, 12);

            var newUser = new User
            {
                Name = request.Name,
                Username = request.Username,
                PasswordHash = hashPassword,
                RoleId = basicUserRole.Id,
                IsActive = true,
                Role = basicUserRole
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var loadedUser = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == newUser.Id);

            var token = GenerateJwtToken(loadedUser ?? newUser);
            return token;
        }

        public async Task<Result> UpdateProfileAsync(UpdateProfileDto request, int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "User not found.");
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                {
                    return Error.Validation(ErrorCodes.CurrentPasswordRequired, "Current password is required.");
                }

                if (!BCrypt.Net.BCrypt.EnhancedVerify(request.CurrentPassword, user.PasswordHash))
                {
                    return Error.Validation(ErrorCodes.InvalidCurrentPassword, "Current password is incorrect.");
                }

                user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.NewPassword, 12);
            }

            await _context.SaveChangesAsync();
            return Result.Success();
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Secret Key is missing")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.RoleName),
                new Claim("PublicId", user.PublicId.ToString())
            };

            if (user.StudentProfile != null) claims.Add(new Claim("CollegeId", user.StudentProfile.CollegeId.ToString()));
            else if (user.CollegeRepresentative != null) claims.Add(new Claim("CollegeId", user.CollegeRepresentative.CollegeId.ToString()));
            else if (user.CompanyRepresentative != null) claims.Add(new Claim("CompanyId", user.CompanyRepresentative.CompanyId.ToString()));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
