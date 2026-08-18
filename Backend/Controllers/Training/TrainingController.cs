using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.DTOs.Training;
using summer_training_app.Extensions;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.Training
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TrainingController : ControllerBase
    {
        private readonly ITrainingService _trainingService;

        public TrainingController(ITrainingService trainingService)
        {
            _trainingService = trainingService;
        }

        [HttpPost("submit-request")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitRequest([FromForm] SubmitTrainingRequestDto dto)
        {
            var studentId = User.GetInternalUserId();
            if (!studentId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _trainingService.SubmitRequestAsync(dto, studentId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(new { id = result.Value });
        }

        [HttpGet("college/pending-requests")]
        [Authorize(Roles = "CollegeRep")]
        public async Task<IActionResult> GetCollegePendingRequests()
        {
            var collegeId = User.GetCollegeId();
            var userId = User.GetInternalUserId();
            if (!collegeId.HasValue || !userId.HasValue)
            {
                return this.ForbiddenProblem("User is not associated with a college or internal user.");
            }

            var result = await _trainingService.GetCollegePendingRequestsAsync(collegeId.Value, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }
        
        [HttpGet("student/pending-requests")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudentPendingRequests()
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _trainingService.GetStudentPendingRequestsAsync(userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpGet("request/{requestPublicId}")]
        [Authorize(Roles = "Student,CollegeRep")]
        public async Task<IActionResult> GetPendingRequest(Guid requestPublicId)
        {
            var result = await _trainingService.GetPendingRequestAsync(requestPublicId);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok(result.Value);
        }

        [HttpPost("process-request")]
        [Authorize(Roles = "CollegeRep")]
        public async Task<IActionResult> ProcessRequest([FromBody] ProcessTrainingRequestDto dto)
        {
            var reviewerUserId = User.GetInternalUserId();
            if (!reviewerUserId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _trainingService.ProcessRequestAsync(dto, reviewerUserId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }

        [HttpPut("update-status")]
        [Authorize(Roles = "CollegeRep")]
        public async Task<IActionResult> UpdateTrainingStatus([FromBody] UpdateTrainingStatusDto dto)
        {
            var userId = User.GetInternalUserId();
            if (!userId.HasValue)
            {
                return this.UnauthorizedProblem();
            }

            var result = await _trainingService.UpdateTrainingStatusAsync(dto, userId.Value);
            if (result.IsFailure)
            {
                return this.ToProblemDetails(result.Error);
            }

            return Ok();
        }
    }
}
