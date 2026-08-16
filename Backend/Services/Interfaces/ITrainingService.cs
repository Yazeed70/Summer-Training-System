using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
using summer_training_app.DTOs.Training;

namespace summer_training_app.Services.Interfaces
{
    public interface ITrainingService
    {
        Task<(Guid RequestPublicId, ApiErrorResponseDTO? Error)> SubmitRequestAsync(SubmitTrainingRequestDto dto, int studentId);
        Task<(List<PendingTrainingRequestDto>? Data, ApiErrorResponseDTO? Error)> GetStudentPendingRequestsAsync(int studentId);
        Task<(MyTrainingRequestDto? Data, ApiErrorResponseDTO? Error)> GetPendingRequestAsync(Guid requestPublicId);
        Task<(List<PendingTrainingRequestDto>? Data, ApiErrorResponseDTO? Error)> GetCollegePendingRequestsAsync(int collegeId, int userId);
        Task<ApiErrorResponseDTO?> ProcessRequestAsync(ProcessTrainingRequestDto dto, int reviewerUserId);
        Task<ApiErrorResponseDTO?> UpdateTrainingStatusAsync(UpdateTrainingStatusDto dto, int userId);
    }
}
