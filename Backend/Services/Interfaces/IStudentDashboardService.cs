using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Reports;

namespace summer_training_app.Services.Interfaces
{
    public interface IStudentDashboardService
    {
        Task<Result<StudentProfileResponseDto>> GetMyProfileAsync(int userId);
        Task<Result> UpdateMyProfileAsync(UpdateStudentProfileDto dto, int userId);
        Task<Result<List<StudentTrainingHistoryDto>>> GetTrainingHistoryAsync(int userId);
        Task<Result<List<StudentReportSummaryDto>>> GetReportsSummaryAsync(int userId);
        Task<Result<List<CollegeAdvisorDto>>> GetCollegeAdvisorAsync(int userId);
        Task<Result<List<CollegeDocumentDto>>> GetCollegeDocumentsAsync(int userId);
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> GetMyProofFileAsync(Guid publicId, int userId);
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> DownloadCollegeDocumentAsync(int documentId, int userId);
    }
}
