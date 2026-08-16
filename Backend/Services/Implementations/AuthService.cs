using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Shared;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


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

        public async Task<(string? Token, ApiErrorResponseDTO? Error)> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.StudentProfile)
                .Include(u => u.CollegeRepresentative)
                .Include(u => u.CompanyRepresentative)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                return (null, new ApiErrorResponseDTO { Code = ErrorCodes.UserNotFound, DevMessage = "User not found." });
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return (null, new ApiErrorResponseDTO { Code = ErrorCodes.UserNotFound, DevMessage = "Username or password is incorrect." });
            }

            if (!user.IsActive)
            {
                return (null, new ApiErrorResponseDTO { Code = ErrorCodes.UserInactive, DevMessage = "User is inactive." });
            }

            var token = GenerateJwtToken(user);
            return (token, null);
        }

        public async Task<(string? Token, ApiErrorResponseDTO? Error)> RegisterAsync(RegisterRequestDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return (null, new ApiErrorResponseDTO { Code = ErrorCodes.UserAlreadyExists, DevMessage = "Username already exists." });
            }

            var basicUserRole = await _context.Roles.FirstOrDefaultAsync(r => r.Id == (byte)enRoles.BasicUser);
            if (basicUserRole == null)
            {
                return (null, new ApiErrorResponseDTO { Code = ErrorCodes.RoleNotFound, DevMessage = "Role not found." });
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
            return (token, null);
        }

        public async Task<ApiErrorResponseDTO?> UpdateProfileAsync(UpdateProfileDto request, int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return (new ApiErrorResponseDTO
            {
                Code = ErrorCodes.UserNotFound,
                DevMessage = "User not found."
            });

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                    return (new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.CurrentPasswordRequired,
                        DevMessage = "Current password is required."
                    });

                if (!BCrypt.Net.BCrypt.EnhancedVerify(request.CurrentPassword, user.PasswordHash))
                    return (new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.InvalidCurrentPassword,
                        DevMessage = "Current password is incorrect."
                    });

                user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.NewPassword, 12);
            }

            await _context.SaveChangesAsync();
            return null;
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
