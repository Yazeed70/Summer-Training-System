using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Common.Constants;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
using summer_training_app.Extensions;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.Dashboard
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _adminDashboardService;

        public AdminDashboardController(IAdminDashboardService adminDashboardService)
        {
            _adminDashboardService = adminDashboardService;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _adminDashboardService.GetStatsAsync();
            return Ok(stats);
        }

        
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var students = await _adminDashboardService.GetAllUsersAsync();
            return Ok(students);
        }
        

        [HttpGet("college-reps")]
        public async Task<IActionResult> GetAllCollegeReps()
        {
            var collegeReps = await _adminDashboardService.GetAllCollegeRepsAsync();
            return Ok(collegeReps);
        }

        [HttpGet("company-reps")]
        public async Task<IActionResult> GetAllCompanyReps()
        {
            var companyReps = await _adminDashboardService.GetAllCompanyRepsAsync();
            return Ok(companyReps);
        }

        [HttpGet("users/{publicId}")]
        public async Task<IActionResult> GetUserDetails(Guid publicId)
        {
            var result = await _adminDashboardService.GetUserDetailsAsync(publicId);
            if (result.Error != null)
            {
                return NotFound(result.Error);
            }
            return Ok(result.Data);
        }

        [HttpPatch("users/{userPublicId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(Guid userPublicId)
        {
            var currentUserId = User.GetInternalUserId();
            if (!currentUserId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _adminDashboardService.ToggleUserStatusAsync(userPublicId, currentUserId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UserNotFound)
                    return NotFound(result.Error);

                return BadRequest(result.Error);
            }

            return Ok(new { newStatus = result.NewStatus });
        }

        [HttpPost("users/{publicId}/reset-password")]
        public async Task<IActionResult> AdminResetUserPassword(Guid publicId, [FromBody] AdminResetPasswordDto dto)
        {
            var error = await _adminDashboardService.AdminResetUserPasswordAsync(publicId, dto);
            if (error != null)
            {
                if (error.Code == ErrorCodes.UserNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpPost("users/college-reps")]
        public async Task<IActionResult> CreateCollegeRep([FromBody] CreateCollegeRepDto dto)
        {
            var error = await _adminDashboardService.CreateCollegeRepAsync(dto);
            if (error != null)
            {
                return BadRequest(error);
            }
            return Ok();
        }
        
        [HttpPost("users/company-reps")]
        public async Task<IActionResult> CreateCompanyRep([FromBody] CreateCompanyRepDto dto)
        {
            var error = await _adminDashboardService.CreateCompanyRepAsync(dto);
            if (error != null)
            {
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpGet("companies")]
        public async Task<IActionResult> GetAllCompanies()
        {
            var companies = await _adminDashboardService.GetAllCompaniesAsync();
            return Ok(companies);
        }

        [HttpGet("companies/pending")]
        public async Task<IActionResult> GetPendingCompanyRequests()
        {
            var requests = await _adminDashboardService.GetPendingCompanyRequests();
            return Ok(requests);
        }

        [HttpPost("companies")]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyDto dto)
        {
            var currentUserId = User.GetInternalUserId();
            if (!currentUserId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _adminDashboardService.CreateCompanyAsync(dto, currentUserId.Value);
            if (result.Error != null)
            {
                return BadRequest(result.Error);
            }
            return CreatedAtAction(nameof(GetCompanyById), new { id = result.CompanyId }, new { companyId = result.CompanyId });
        }

        [HttpGet("companies/{id}")]
        public async Task<IActionResult> GetCompanyById(int id)
        {
            var result = await _adminDashboardService.GetCompanyByIdAsync(id);
            if (result.Error != null)
            {
                return NotFound(result.Error);
            }
            return Ok(result.Data);
        }

        [HttpPut("companies/{id}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CreateCompanyDto dto)
        {
            var error = await _adminDashboardService.UpdateCompanyAsync(id, dto);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }
        
        [HttpPatch("companies/{id}/approve")]
        public async Task<IActionResult> ApproveCompany(int id)
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

            var error = await _adminDashboardService.ApproveCompanyAsync(id, userId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpPatch("companies/{id}/toggle-status")]
        public async Task<IActionResult> ToggleCompanyStatus(int id)
        {
            var error = await _adminDashboardService.ToggleCompanyStatusAsync(id);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpDelete("companies/{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var error = await _adminDashboardService.DeleteCompanyAsync(id);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return NoContent();
        }

        [HttpGet("colleges")]
        public async Task<IActionResult> GetAllColleges()
        {
            var colleges = await _adminDashboardService.GetAllCollegesAsync();
            return Ok(colleges);
        }

        [HttpPost("colleges")]
        public async Task<IActionResult> CreateCollege([FromBody] CreateCollegeDto dto)
        {
            var result = await _adminDashboardService.CreateCollegeAsync(dto);
            if (result.Error != null)
            {
                return BadRequest(result.Error);
            }
            return CreatedAtAction(nameof(GetCollegeById), new { id = result.CollegeId }, new { collegeId = result.CollegeId });
        }

        [HttpGet("colleges/{id}")]
        public async Task<IActionResult> GetCollegeById(int id)
        {
            var result = await _adminDashboardService.GetCollegeByIdAsync(id);
            if (result.Error != null)
            {
                return NotFound(result.Error);
            }
            return Ok(result.Data);
        }

        [HttpPut("colleges/{id}")]
        public async Task<IActionResult> UpdateCollege(int id, [FromBody] CreateCollegeDto dto)
        {
            var error = await _adminDashboardService.UpdateCollegeAsync(id, dto);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CollegeNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }
        
        [HttpPatch("colleges/{id}/toggle-status")]
        public async Task<IActionResult> ToggleCollegeStatus(int id)
        {
            var error = await _adminDashboardService.ToggleCollegeStatusAsync(id);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CollegeNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpDelete("colleges/{id}")]
        public async Task<IActionResult> DeleteCollege(int id)
        {
            var error = await _adminDashboardService.DeleteCollegeAsync(id);
            if (error != null)
            {
                if (error.Code == ErrorCodes.CollegeNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return NoContent();
        }

        [HttpGet("upgrade-requests")]
        public async Task<IActionResult> GetUpgradeRequests()
        {
            var requests = await _adminDashboardService.GetUpgradeRequestsAsync();
            return Ok(requests);
        }
        
        [HttpGet("upgrade-request/{publicId}")]
        public async Task<IActionResult> GetUpgradeRequest(Guid publicId)
        {
            var request = await _adminDashboardService.GetUpgradeRequestByIdAsync(publicId);
            if (request == null)
            {
                return NotFound(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UpgradeRequestNotFound,
                    DevMessage = "Upgrade request not found."
                });
            }
            return Ok(request);
        }

        [HttpPost("upgrade-requests/{publicId}/approve")]
        public async Task<IActionResult> ApproveUpgradeRequest([FromRoute] Guid publicId)
        {
            var reviewerUserId = User.GetInternalUserId();
            if (!reviewerUserId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var error = await _adminDashboardService.ApproveUpgradeRequestAsync(publicId, reviewerUserId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.UpgradeRequestNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpPost("upgrade-requests/{publicId}/reject")]
        public async Task<IActionResult> RejectUpgradeRequest([FromRoute] Guid publicId, [FromBody] HandleUpgradeRequestDto dto)
        {
            var reviewerUserId = User.GetInternalUserId();
            if (!reviewerUserId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var error = await _adminDashboardService.RejectUpgradeRequestAsync(publicId, dto.Comment, reviewerUserId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.UpgradeRequestNotFound)
                    return NotFound(error);
                return BadRequest(error);
            }
            return Ok();
        }

        [HttpGet("upgrade-requests/proof/{publicId}")]
        public async Task<IActionResult> GetProofFile(Guid publicId)
        {
            var result = await _adminDashboardService.GetProofFileAsync(publicId);
            if (result.Error != null)
            {
                return NotFound(result.Error);
            }

            return PhysicalFile(result.PhysicalPath!, result.ContentType!, result.FileName!);
        }
    }
}
