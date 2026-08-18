using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Training;

namespace summer_training_app.Services.Interfaces
{
    public interface ITrainingService
    {
        Task<Result<Guid>> SubmitRequestAsync(SubmitTrainingRequestDto dto, int studentId);
        Task<Result<List<PendingTrainingRequestDto>>> GetStudentPendingRequestsAsync(int studentId);
        Task<Result<MyTrainingRequestDto>> GetPendingRequestAsync(Guid requestPublicId);
        Task<Result<List<PendingTrainingRequestDto>>> GetCollegePendingRequestsAsync(int collegeId, int userId);
        Task<Result> ProcessRequestAsync(ProcessTrainingRequestDto dto, int reviewerUserId);
        Task<Result> UpdateTrainingStatusAsync(UpdateTrainingStatusDto dto, int userId);
    }
}
