using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Common.Constants;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
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
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
                });
            }

            var result = await _companyDashboardService.GetCompanyProfileAsync(companyId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(result.Error);

                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateCompanyProfile([FromBody] CreateCompanyDto dto)
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
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

            var error = await _companyDashboardService.UpdateCompanyAsync(dto, companyId.Value, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpDelete("profile")]
        public async Task<IActionResult> DeleteCompanyProfile()
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
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

            var error = await _companyDashboardService.DeleteCompanyAsync(companyId.Value, userId.Value);

            if (error != null)
            {
                if (error.Code == ErrorCodes.CompanyNotFound)
                    return NotFound(error);

                if (error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, error);

                return BadRequest(error);
            }

            return Ok();
        }

        [HttpGet("company-students")]
        public async Task<IActionResult> GetCompanyStudents()
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
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

            var result = await _companyDashboardService.GetCompanyStudentsAsync(companyId.Value, userId.Value);

            if (result.Error != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result.Error);
            }

            return Ok(result.Data);
        }

        [HttpGet("student-profile/{studentPublicId}")]
        public async Task<IActionResult> GetStudentProfile(Guid studentPublicId)
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
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

            var result = await _companyDashboardService.GetStudentProfileAsync(studentPublicId, companyId.Value);

            if (result.Error != null)
            {
                if (result.Error.Code == ErrorCodes.UnauthorizedAccess)
                    return StatusCode(StatusCodes.Status403Forbidden, result.Error);

                return NotFound(result.Error);
            }

            return Ok(result.Data);
        }

        [HttpPost("students/link")]
        public async Task<IActionResult> LinkStudent([FromBody] CreateTrainingRecordDto dto)
        {
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
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

            var result = await _companyDashboardService.LinkCompanyStudentAsync(dto, companyId.Value, userId.Value);

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
            var companyId = User.GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest(new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not associated with a company."
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

            var error = await _companyDashboardService.UnlinkCompanyStudentAsync(studentPublicId, companyId.Value, userId.Value);

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
    }
}
