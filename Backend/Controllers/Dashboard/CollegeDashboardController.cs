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
    [Authorize(Roles = "CollegeRep")]
    public class CollegeDashboardController : ControllerBase
    {
        private readonly ICollegeDashboardService _collegeDashboardService;

        public CollegeDashboardController(ICollegeDashboardService collegeDashboardService)
        {
            _collegeDashboardService = collegeDashboardService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetCollegeProfile()
        {
            var collegeId = User.GetCollegeId();
            if (!collegeId.HasValue)
            {
                return this.ForbiddenProblem("User is not associated with a college.");
            }

            var result = await _collegeDashboardService.GetCollegeProfileAsync(collegeId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateCollegeProfile([FromBody] CreateCollegeDto dto)
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.UpdateCollegeAsync(dto, collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpDelete("profile")]
        public async Task<IActionResult> DeleteCollegeProfile()
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.DeleteCollegeAsync(collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpGet("college-students")]
        public async Task<IActionResult> GetCollegeStudents()
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.GetCollegeStudentsAsync(collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("student-profile/{studentPublicId}")]
        public async Task<IActionResult> GetStudentProfile(Guid studentPublicId)
        {
            var collegeId = User.GetCollegeId();
            if (!collegeId.HasValue)
            {
                return this.ForbiddenProblem("User is not associated with a college.");
            }

            var result = await _collegeDashboardService.GetStudentProfileAsync(studentPublicId, collegeId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPost("students/{userPublicId}/link")]
        public async Task<IActionResult> LinkStudent(Guid userPublicId)
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.LinkCollegeStudentAsync(userPublicId, collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { studentPublicId = result.Value });
        }

        [HttpDelete("students/{studentPublicId}")]
        public async Task<IActionResult> UnlinkStudent(Guid studentPublicId)
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.UnlinkCollegeStudentAsync(studentPublicId, collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpPost("upload-documents")]
        public async Task<IActionResult> UploadCollegeDocument([FromForm] UploadDocumentDto dto)
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.UploadCollegeDocumentAsync(dto, collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpDelete("{documentId}")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.DeleteDocumentAsync(documentId, collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpGet("pending-student-requests")]
        public async Task<IActionResult> GetPendingStudentRequests()
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.GetPendingStudentRequestsAsync(collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("handled-student-requests")]
        public async Task<IActionResult> GetHandledStudentRequests()
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.GetHandledStudentRequestsAsync(collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("student-requests/{publicId}")]
        public async Task<IActionResult> GetStudentRequestDetails(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _collegeDashboardService.GetStudentRequestDetailsAsync(publicId, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPost("handle-student-request/{publicId}")]
        public async Task<IActionResult> HandleStudentRequest(Guid publicId, [FromBody] HandleUpgradeRequestDto dto)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _collegeDashboardService.HandleStudentRequestAsync(publicId, dto, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { message = dto.IsApproved ? "Student request approved successfully." : "Student request rejected successfully." });
        }

        [HttpGet("student-requests/proof/{publicId}")]
        public async Task<IActionResult> GetProofFile(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            var collegeId = User.GetCollegeId();
            if (!userId.HasValue || !collegeId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.GetProofFileAsync(publicId, collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return PhysicalFile(result.Value.PhysicalPath, result.Value.ContentType, result.Value.FileName);
        }

        [HttpGet("document/{documentId}")]
        public async Task<IActionResult> DownloadCollegeDocument(int documentId)
        {
            var collegeId = User.GetCollegeId();
            if (!collegeId.HasValue)
            {
                return this.ForbiddenProblem("User is not associated with a college.");
            }

            var result = await _collegeDashboardService.DownloadDocumentAsync(documentId, collegeId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return PhysicalFile(result.Value.PhysicalPath, result.Value.ContentType, result.Value.FileName);
        }

        [HttpGet("documents")]
        public async Task<IActionResult> GetDocuments()
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User identity or college association is missing.");
            }

            var result = await _collegeDashboardService.GetDocumentsAsync(collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }
    }
}
