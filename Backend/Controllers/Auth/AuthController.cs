using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.DTOs.Auth;
using summer_training_app.Extensions;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.Auth
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

            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { token = result.Value });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var result = await _authService.RegisterAsync(request);

            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { token = result.Value });
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _authService.UpdateProfileAsync(dto, userId.Value);

            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }
    }
}