using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
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
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpPatch("users/{userPublicId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(Guid userPublicId)
        {
            var currentUserId = User.GetInternalUserId();
            if (!currentUserId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _adminDashboardService.ToggleUserStatusAsync(userPublicId, currentUserId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { newStatus = result.Value });
        }

        [HttpPost("users/{publicId}/reset-password")]
        public async Task<IActionResult> AdminResetUserPassword(Guid publicId, [FromBody] AdminResetPasswordDto dto)
        {
            var result = await _adminDashboardService.AdminResetUserPasswordAsync(publicId, dto);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }

        [HttpPost("users/college-reps")]
        public async Task<IActionResult> CreateCollegeRep([FromBody] CreateCollegeRepDto dto)
        {
            var result = await _adminDashboardService.CreateCollegeRepAsync(dto);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }
        
        [HttpPost("users/company-reps")]
        public async Task<IActionResult> CreateCompanyRep([FromBody] CreateCompanyRepDto dto)
        {
            var result = await _adminDashboardService.CreateCompanyRepAsync(dto);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
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
                return this.UnauthorizedProblem();
            }

            var result = await _adminDashboardService.CreateCompanyAsync(dto, currentUserId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return CreatedAtAction(nameof(GetCompanyById), new { id = result.Value }, new { companyId = result.Value });
        }

        [HttpGet("companies/{id}")]
        public async Task<IActionResult> GetCompanyById(int id)
        {
            var result = await _adminDashboardService.GetCompanyByIdAsync(id);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpPut("companies/{id}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CreateCompanyDto dto)
        {
            var result = await _adminDashboardService.UpdateCompanyAsync(id, dto);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }
        
        [HttpPatch("companies/{id}/approve")]
        public async Task<IActionResult> ApproveCompany(int id)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _adminDashboardService.ApproveCompanyAsync(id, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }

        [HttpPatch("companies/{id}/toggle-status")]
        public async Task<IActionResult> ToggleCompanyStatus(int id)
        {
            var result = await _adminDashboardService.ToggleCompanyStatusAsync(id);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }

        [HttpDelete("companies/{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var result = await _adminDashboardService.DeleteCompanyAsync(id);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
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
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return CreatedAtAction(nameof(GetCollegeById), new { id = result.Value }, new { collegeId = result.Value });
        }

        [HttpGet("colleges/{id}")]
        public async Task<IActionResult> GetCollegeById(int id)
        {
            var result = await _adminDashboardService.GetCollegeByIdAsync(id);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpPut("colleges/{id}")]
        public async Task<IActionResult> UpdateCollege(int id, [FromBody] CreateCollegeDto dto)
        {
            var result = await _adminDashboardService.UpdateCollegeAsync(id, dto);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }
        
        [HttpPatch("colleges/{id}/toggle-status")]
        public async Task<IActionResult> ToggleCollegeStatus(int id)
        {
            var result = await _adminDashboardService.ToggleCollegeStatusAsync(id);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }

        [HttpDelete("colleges/{id}")]
        public async Task<IActionResult> DeleteCollege(int id)
        {
            var result = await _adminDashboardService.DeleteCollegeAsync(id);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
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
            var result = await _adminDashboardService.GetUpgradeRequestByIdAsync(publicId);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpPost("upgrade-requests/{publicId}/approve")]
        public async Task<IActionResult> ApproveUpgradeRequest([FromRoute] Guid publicId)
        {
            var reviewerUserId = User.GetInternalUserId();
            if (!reviewerUserId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _adminDashboardService.ApproveUpgradeRequestAsync(publicId, reviewerUserId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }

        [HttpPost("upgrade-requests/{publicId}/reject")]
        public async Task<IActionResult> RejectUpgradeRequest([FromRoute] Guid publicId, [FromBody] HandleUpgradeRequestDto dto)
        {
            var reviewerUserId = User.GetInternalUserId();
            if (!reviewerUserId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _adminDashboardService.RejectUpgradeRequestAsync(publicId, dto.Comment, reviewerUserId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }
            return Ok();
        }

        [HttpGet("upgrade-requests/proof/{publicId}")]
        public async Task<IActionResult> GetProofFile(Guid publicId)
        {
            var result = await _adminDashboardService.GetProofFileAsync(publicId);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return PhysicalFile(result.Value.PhysicalPath, result.Value.ContentType, result.Value.FileName);
        }
    }
}
