using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Common.Constants;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
using summer_training_app.Extensions;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.Dashboard
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserDashboardController : ControllerBase
    {
        private readonly IUserDashboardService _userDashboardService;

        public UserDashboardController(IUserDashboardService userDashboardService)
        {
            _userDashboardService = userDashboardService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var result = await _userDashboardService.GetUserProfileAsync(userId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UserNotFound)
                    return NotFound(result.Error);
                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var error = await _userDashboardService.UpdateUserProfileAsync(dto, userId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.UserNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPost("upgrade-request")]
        public async Task<IActionResult> SubmitGenericUpgradeRequest([FromForm] UpgradeRoleDto dto)
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var error = await _userDashboardService.SubmitUpgradeRequestAsync(dto, userId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CollegeNotFound || error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);

                return BadRequest(error);
            }

            return Ok(new { message = "Role upgrade request submitted successfully." });
        }

        [HttpGet("upgrade-status")]
        public async Task<IActionResult> GetUpgradeStatus()
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var result = await _userDashboardService.GetMyUpgradeRequestStatusAsync(userId.Value);
            if (result.Error != null)
            {
                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("upgrade-history")]
        public async Task<IActionResult> GetUpgradeHistory()
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var result = await _userDashboardService.GetMyUpgradeHistoryAsync(userId.Value);
            if (result.Error != null)
            {
                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPatch("cancel-request/{publicId}")]
        public async Task<IActionResult> CancelUpgradeRequest(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var error = await _userDashboardService.CancelUpgradeRequestAsync(publicId, userId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.UpgradeRequestNotFound)
                    return NotFound(error);

                return BadRequest(error);
            }

            return Ok(new { message = "Upgrade request canceled successfully." });
        }

        [HttpGet("colleges")]
        public async Task<IActionResult> GetAllCollegesDetails()
        {
            var colleges = await _userDashboardService.GetAllCollegesDetailsAsync();
            return Ok(colleges);
        }

        [HttpGet("companies")]
        public async Task<IActionResult> GetAllCompaniesDetails()
        {
            var companies = await _userDashboardService.GetAllCompaniesDetailsAsync();
            return Ok(companies);
        }

        [HttpGet("upgrade-requests/proof/{publicId}")]
        public async Task<IActionResult> GetProofFile(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity is invalid or missing."
                });
            }

            var result = await _userDashboardService.GetMyProofFileAsync(publicId, userId.Value);
            if (result.Error != null)
            {
                return NotFound(result.Error);
            }

            return PhysicalFile(result.PhysicalPath!, result.ContentType!, result.FileName!);
        }
    }
}
