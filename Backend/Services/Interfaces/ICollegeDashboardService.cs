using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;

namespace summer_training_app.Services.Interfaces
{
    public interface ICollegeDashboardService
    {
        Task<Result<CollegeDetailsDto>> GetCollegeProfileAsync(int collegeId);
        Task<Result> UpdateCollegeAsync(CreateCollegeDto dto, int collegeId, int userId);
        Task<Result> DeleteCollegeAsync(int collegeId, int userId);
        Task<Result<StudentProfileResponseDto>> GetStudentProfileAsync(Guid studentPublicId, int collegeId);
        Task<Result<List<CollegeStudentsListDto>>> GetCollegeStudentsAsync(int collegeId, int userId);
        Task<Result<Guid>> LinkCollegeStudentAsync(Guid userPublicId, int collegeId, int userId);
        Task<Result> UnlinkCollegeStudentAsync(Guid studentPublicId, int collegeId, int userId);

        Task<Result> UploadCollegeDocumentAsync(UploadDocumentDto dto, int collegeId, int userId);
        Task<Result> DeleteDocumentAsync(int documentId, int collegeId, int userId);

        Task<Result<List<CollegeStudentsUpgradeRequestsListDto>>> GetPendingStudentRequestsAsync(int collegeId, int userId);
        Task<Result<List<CollegeStudentsUpgradeRequestsListDto>>> GetHandledStudentRequestsAsync(int collegeId, int userId);
        Task<Result<UpgradeRequestDetailsDto>> GetStudentRequestDetailsAsync(Guid requestPublicId, int collegeRepId);
        Task<Result> HandleStudentRequestAsync(Guid requestPublicId, HandleUpgradeRequestDto dto, int collegeRepId);
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> GetProofFileAsync(Guid publicId, int collegeId, int userId);
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> DownloadDocumentAsync(int documentId, int collegeId);
        Task<Result<List<CollegeDocumentDto>>> GetDocumentsAsync(int collegeId, int userId);
    }
}
