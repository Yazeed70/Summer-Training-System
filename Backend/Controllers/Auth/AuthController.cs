using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Shared;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Extensions;
using summer_training_app.Services.Implementations;
using summer_training_app.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace summer_training_app.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UserNotFound || result.Error.Code == ErrorCodes.UserInactive)
                    return Unauthorized(result.Error);

                return BadRequest(result.Error);
            }
            return Ok(new { token = result.Token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var result = await _authService.RegisterAsync(request);

            if (result.Error != null)
            {
                return BadRequest(result.Error);
            }

            return Ok(new { token = result.Token });
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _authService.UpdateProfileAsync(dto, userId.Value);

            if (result != null)
            {
                return BadRequest(result);
            }

            return Ok();
        }
    }
}