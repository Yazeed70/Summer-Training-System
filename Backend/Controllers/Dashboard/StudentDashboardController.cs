using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.Extensions;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.Dashboard
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentDashboardController : ControllerBase
    {
        private readonly IStudentDashboardService _studentDashboardService;

        public StudentDashboardController(IStudentDashboardService studentDashboardService)
        {
            _studentDashboardService = studentDashboardService;
        }

        [HttpGet("stu-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.GetMyProfileAsync(userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateStudentProfileDto dto)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.UpdateMyProfileAsync(dto, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { message = "Student profile updated successfully." });
        }

        [HttpGet("training-history")]
        public async Task<IActionResult> GetTrainingHistory()
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.GetTrainingHistoryAsync(userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("reports-summary")]
        public async Task<IActionResult> GetReportsSummary()
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.GetReportsSummaryAsync(userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("college-advisor")]
        public async Task<IActionResult> GetCollegeAdvisor()
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.GetCollegeAdvisorAsync(userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("college-documents")]
        public async Task<IActionResult> GetCollegeDocuments()
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.GetCollegeDocumentsAsync(userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("proof/{publicId}")]
        public async Task<IActionResult> GetProofFile(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.GetMyProofFileAsync(publicId, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return PhysicalFile(result.Value.PhysicalPath, result.Value.ContentType, result.Value.FileName);
        }

        [HttpGet("college-document/{documentId}")]
        public async Task<IActionResult> DownloadCollegeDocument(int documentId)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _studentDashboardService.DownloadCollegeDocumentAsync(documentId, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return PhysicalFile(result.Value.PhysicalPath, result.Value.ContentType, result.Value.FileName);
        }
    }
}
