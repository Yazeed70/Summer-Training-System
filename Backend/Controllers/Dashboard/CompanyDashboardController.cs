using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.Extensions;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.Dashboard
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "CompanyRep")]
    public class CompanyDashboardController : ControllerBase
    {
        private readonly ICompanyDashboardService _companyDashboardService;

        public CompanyDashboardController(ICompanyDashboardService companyDashboardService)
        {
            _companyDashboardService = companyDashboardService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetCompanyProfile()
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return this.ForbiddenProblem("User is not associated with a company.");
            }

            var result = await _companyDashboardService.GetCompanyProfileAsync(companyId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateCompanyProfile([FromBody] CreateCompanyDto dto)
        {
            var companyId = User.GetCompanyId();
            var userId = User.GetInternalUserId();
            if (!companyId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or company association is missing.");
            }

            var result = await _companyDashboardService.UpdateCompanyAsync(dto, companyId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpDelete("profile")]
        public async Task<IActionResult> DeleteCompanyProfile()
        {
            var companyId = User.GetCompanyId();
            var userId = User.GetInternalUserId();
            if (!companyId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or company association is missing.");
            }

            var result = await _companyDashboardService.DeleteCompanyAsync(companyId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpGet("company-students")]
        public async Task<IActionResult> GetCompanyStudents()
        {
            var companyId = User.GetCompanyId();
            var userId = User.GetInternalUserId();
            if (!companyId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or company association is missing.");
            }

            var result = await _companyDashboardService.GetCompanyStudentsAsync(companyId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("student-profile/{studentPublicId}")]
        public async Task<IActionResult> GetStudentProfile(Guid studentPublicId)
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return this.ForbiddenProblem("User is not associated with a company.");
            }

            var result = await _companyDashboardService.GetStudentProfileAsync(studentPublicId, companyId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPost("students/link")]
        public async Task<IActionResult> LinkStudent([FromBody] CreateTrainingRecordDto dto)
        {
            var companyId = User.GetCompanyId();
            var userId = User.GetInternalUserId();
            if (!companyId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or company association is missing.");
            }

            var result = await _companyDashboardService.LinkCompanyStudentAsync(dto, companyId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { studentPublicId = result.Value });
        }

        [HttpDelete("students/{studentPublicId}")]
        public async Task<IActionResult> UnlinkStudent(Guid studentPublicId)
        {
            var companyId = User.GetCompanyId();
            var userId = User.GetInternalUserId();
            if (!companyId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or company association is missing.");
            }

            var result = await _companyDashboardService.UnlinkCompanyStudentAsync(studentPublicId, companyId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }
    }
}
