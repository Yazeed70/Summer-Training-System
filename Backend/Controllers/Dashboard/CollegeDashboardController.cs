using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Common.Constants;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
using summer_training_app.Extensions;
using summer_training_app.Services.Implementations;
using summer_training_app.Services.Interfaces;
using System;
using System.Reflection.Metadata;
using System.Threading.Tasks;

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
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var result = await _collegeDashboardService.GetCollegeProfileAsync(collegeId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.CollegeNotFound)
                    return NotFound(result.Error);

                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateCollegeProfile([FromBody] CreateCollegeDto dto)
        {
            var collegeId = User.GetCollegeId();
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if(userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var error = await _collegeDashboardService.UpdateCollegeAsync(dto, collegeId.Value, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.CollegeNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpDelete("profile")]
        public async Task<IActionResult> DeleteCollegeProfile()
        {
            var collegeId = User.GetCollegeId();
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if(userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var error = await _collegeDashboardService.DeleteCollegeAsync(collegeId.Value, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.CollegeNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpGet("college-students")]
        public async Task<IActionResult> GetCollegeStudents()
        {
            var collegeId = User.GetCollegeId();
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if(userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var result = await _collegeDashboardService.GetCollegeStudentsAsync(collegeId.Value, userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("student-profile/{studentPublicId}")]
        public async Task<IActionResult> GetStudentProfile(Guid studentPublicId)
        {
            var collegeId = User.GetCollegeId();
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if(userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var result = await _collegeDashboardService.GetStudentProfileAsync(studentPublicId, collegeId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return NotFound(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPost("students/{userPublicId}/link")]
        public async Task<IActionResult> LinkStudent(Guid userPublicId)
        {
            var collegeId = User.GetCollegeId();
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if(userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var result = await _collegeDashboardService.LinkCollegeStudentAsync(userPublicId, collegeId.Value, userId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UserNotFound)
                    return NotFound(result.Error);

                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return BadRequest(result.Error);
            }

            return Ok(new { studentPublicId = result.NewPublicId });
        }

        [HttpDelete("students/{studentPublicId}")]
        public async Task<IActionResult> UnlinkStudent(Guid studentPublicId)
        {
            var collegeId = User.GetCollegeId();
            if(collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if(userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var error = await _collegeDashboardService.UnlinkCollegeStudentAsync(studentPublicId, collegeId.Value, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.UserNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpPost("upload-documents")]
        public async Task<IActionResult> UploadCollegeDocument([FromForm] UploadDocumentDto dto)
        {
            var collegeId = User.GetCollegeId();
            if (collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var result = await _collegeDashboardService.UploadCollegeDocumentAsync(dto, collegeId.Value, userId.Value);

            if (result != null)
            {
                if (result.Code == ErrorCodes.InvalidCollegeId)
                    return Unauthorized(result);

                return BadRequest(result);
            }

            return Ok();
        }

        [HttpDelete("{documentId}")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            var collegeId = User.GetCollegeId();
            if (collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }
            var error = await _collegeDashboardService.DeleteDocumentAsync(documentId, collegeId.Value, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.DocumentNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                if (error.Code == ErrorCodes.InvalidCollegeId)
                    return Unauthorized(error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpGet("pending-student-requests")]
        public async Task<IActionResult> GetPendingStudentRequests()
        {
            var collegeId = User.GetCollegeId();
            if (collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }

            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _collegeDashboardService.GetPendingStudentRequestsAsync(collegeId.Value, userId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("handled-student-requests")]
        public async Task<IActionResult> GetHandledStudentRequests()
        {
            var collegeId = User.GetCollegeId();
            if (collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }

            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _collegeDashboardService.GetHandledStudentRequestsAsync(collegeId.Value, userId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("student-requests/{publicId}")]
        public async Task<IActionResult> GetStudentRequestDetails(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _collegeDashboardService.GetStudentRequestDetailsAsync(publicId, userId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UpgradeRequestNotFound)
                    return NotFound(result.Error);

                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPost("handle-student-request/{publicId}")]
        public async Task<IActionResult> HandleStudentRequest(Guid publicId, [FromBody] HandleUpgradeRequestDto dto)
        {
            var userId = User.GetInternalUserId();
            if (userId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var error = await _collegeDashboardService.HandleStudentRequestAsync(publicId, dto, userId.Value);
            if (error != null)
            {
                if (error.Code == ErrorCodes.UpgradeRequestNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok(new { message = dto.IsApproved ? "Student request approved successfully." : "Student request rejected successfully." });
        }

        [HttpGet("student-requests/proof/{publicId}")]
        public async Task<IActionResult> GetProofFile(Guid publicId)
        {
            var userId = User.GetInternalUserId();
            var collegeId = User.GetCollegeId();
            if (userId == null || collegeId == null)
            {
                return Unauthorized(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User identity or college association is missing."
                });
            }

            var result = await _collegeDashboardService.GetProofFileAsync(publicId, collegeId.Value, userId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.FileNotFound) return NotFound(result.Error);
                if (result.Error.Code == ErrorCodes.UnauthorizedAccess) return StatusCode(StatusCodes.Status403Forbidden, result.Error);
                return BadRequest(result.Error);
            }

            return PhysicalFile(result.PhysicalPath!, result.ContentType!, result.FileName!);
        }

        [HttpGet("document/{documentId}")]
        public async Task<IActionResult> DownloadCollegeDocument(int documentId)
        {
            var collegeId = User.GetCollegeId();
            if (collegeId == null)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }

            var result = await _collegeDashboardService.DownloadDocumentAsync(documentId, collegeId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.DocumentNotFound || result.Error.Code == ErrorCodes.FileNotFound)
                    return NotFound(result.Error);
                return BadRequest(result.Error);
            }

            return PhysicalFile(result.PhysicalPath!, result.ContentType!, result.FileName!);
        }

        [HttpGet("documents")]
        public async Task<IActionResult> GetDocuments()
        {
            var collegeId = User.GetCollegeId();
            if (!collegeId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a college."
                });
            }
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var result = await _collegeDashboardService.GetDocumentsAsync(collegeId.Value, userId.Value);
            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }
    }
}
