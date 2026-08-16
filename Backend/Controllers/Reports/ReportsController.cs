using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Common.Constants;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;
using summer_training_app.Extensions;
using summer_training_app.Services.Implementations;
using summer_training_app.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace summer_training_app.Controllers.Reports
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _reportsService;
        private readonly IFilesService _filesService;
        public ReportsController(IReportsService reportsService, IFilesService filesService)
        {
            _reportsService = reportsService;
            _filesService = filesService;
        }

        [HttpPost("create-report")]
        [Authorize(Roles = "CollegeRep,CompanyRep")]
        public async Task<IActionResult> CreateReport([FromBody] SaveTemplateDto reportDto)
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

            var result = await _reportsService.CreateReportTemplateAsync(reportDto, userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(new
            {
                reportPublicId = result.ReportTemplatePublicId
            });
        }

        [HttpGet("my-reports")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyReports()
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

            var result = await _reportsService.GetMyReportsAsync(userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPost("submit-report")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitReport([FromBody] SubmitReportDto submissionDto)
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

            var result = await _reportsService.SubmitReportAsync(submissionDto, userId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.TemplateNotFound)
                    return NotFound(result.Error);

                return BadRequest(result.Error);
            }

            return Ok(new
            {
                studentReportId = result.StudentReportPublicId
            });
        }

        [HttpGet("company-reports")]
        [Authorize(Roles = "CompanyRep")]
        public async Task<IActionResult> GetCompanyReports()
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

            var result = await _reportsService.GetCompanyReportsAsync(userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("college-templates")]
        [Authorize(Roles = "CollegeRep")]
        public async Task<IActionResult> GetCollegeTemplates()
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

            var result = await _reportsService.GetCollegeTemplatesAsync(userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("company-templates")]
        [Authorize(Roles = "CompanyRep")]
        public async Task<IActionResult> GetCompanyTemplates()
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

            var result = await _reportsService.GetCompanyTemplatesAsync(userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPost("evaluate-report")]
        [Authorize(Roles = "CompanyRep,CollegeRep")]
        public async Task<IActionResult> EvaluateReport([FromBody] EvaluateReportDto evalDto)
        {
            var supervisorId = User.GetInternalUserId();
            if (!supervisorId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with an internal user."
                });
            }

            var error = await _reportsService.EvaluateReportAsync(evalDto, supervisorId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.StudentReportNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess || error.Code == ErrorCodes.InvalidCompanyId)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpDelete("template/{TemplatePublicId}")]
        [Authorize(Roles = "CollegeRep,CompanyRep")]
        public async Task<IActionResult> DeleteTemplate(Guid TemplatePublicId)
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

            var error = await _reportsService.DeleteTemplateAsync(TemplatePublicId, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.TemplateNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess || error.Code == ErrorCodes.InvalidCollegeId)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpPut("template/{TemplatePublicId}")]
        [Authorize(Roles = "CollegeRep,CompanyRep")]
        public async Task<IActionResult> UpdateTemplateReport(Guid TemplatePublicId, [FromBody] SaveTemplateDto updateDto)
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

            if (!updateDto.TemplatePublicId.HasValue || updateDto.TemplatePublicId.Value == Guid.Empty)
            {
                updateDto.TemplatePublicId = TemplatePublicId;
            }

            var error = await _reportsService.UpdateTemplateAsync(updateDto, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.TemplateNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess || error.Code == ErrorCodes.InvalidCollegeId)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpGet("template/{id}")]
        [Authorize(Roles = "Student,CollegeRep,CompanyRep")]
        public async Task<IActionResult> GetTemplateDetails(Guid id)
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

            var result = await _reportsService.GetTemplateDetailsAsync(id, userId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.TemplateNotFound)
                    return NotFound(result.Error);

                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("college-student-reports")]
        [Authorize(Roles = "CollegeRep")]
        public async Task<IActionResult> GetCollegeStudentReports()
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

            var result = await _reportsService.GetCollegeReportsAsync(userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPost("upload-attachment")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UploadReportAttachment(IFormFile file)
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

            var result = await _filesService.UploadFileAsync(file, "report_attachments");

            if (result.Error != null)
                return BadRequest(result.Error);

            return Ok(new
            {
                FilePath = result.Data.Value.FilePath
            });
        }

        [HttpGet("download-attachment")]
        [Authorize(Roles ="CollegeRep,CompanyRep")]
        public async Task<IActionResult> DownloadAttachment([FromQuery] string filePath)
        {
            var companyId = User.GetCompanyId();
            var collegeId = User.GetCollegeId();

            if (!companyId.HasValue && !collegeId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company or college."
                });
            }

            var result = await _filesService.DownloadFileAsync(filePath);
            if (result.Error != null) return BadRequest(result.Error);

            return PhysicalFile(result.Data.Value.PhysicalPath, result.Data.Value.ContentType, result.Data.Value.FileName);
        }
    }
}
