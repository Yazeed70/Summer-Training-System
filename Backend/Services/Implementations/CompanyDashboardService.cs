using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;
using summer_training_app.DTOs.Training;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class CompanyDashboardService : ICompanyDashboardService
    {
        private readonly SummerTrainingDBContext _context;

        public CompanyDashboardService(SummerTrainingDBContext context)
        {
            _context = context;
        }

        public async Task<(CompanyDetailsDto? Data, ApiErrorResponseDTO? Error)> GetCompanyProfileAsync(int companyId)
        {
            var company = await _context.Companies.Include(c => c.TrainingRecords).FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CompanyNotFound,
                    DevMessage = "Company not found."
                });
            }

            return (new CompanyDetailsDto
            {
                Id = company.Id,
                Name = company.CompanyName,
                ContactEmail = company.ContactEmail,
                Address = company.CompanyAddress,
                IsApproved = company.IsApproved,
                IsActive = !company.IsDeleted,
                CreatedAt = company.CreatedAt,
                TotalStudents = company.TrainingRecords.Count(tr => tr.Status == enTrainingStatus.Active)
            }, null);
        }

        public async Task<ApiErrorResponseDTO?> UpdateCompanyAsync(CreateCompanyDto dto, int companyId, int userId)
        {
            if (!await IsUserCompanyRepresentativeAsync(userId, companyId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to update this company."
                };
            }

            var company = await _context.Companies
                .Include(c => c.CompanyRepresentatives)
                .FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CompanyNotFound,
                    DevMessage = "Company not found."
                };
            }

            company.CompanyName = dto.Name;
            company.ContactEmail = dto.ContactEmail;
            if (dto.Address != null)
            {
                company.CompanyAddress = dto.Address;
            }

            await _context.SaveChangesAsync();
            return null;
        }
        
        public async Task<ApiErrorResponseDTO?> AddCompanyRepresentativeAsync(int userId, int companyId, int currentUserId)
        {
            if (!await IsUserCompanyRepresentativeAsync(currentUserId, companyId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to add company representatives."
                };
            }

            var company = await _context.Companies
                .Include(c => c.CompanyRepresentatives)
                .FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CompanyNotFound,
                    DevMessage = "Company not found."
                };
            }

            var IsAlreadyRepresentative = company.CompanyRepresentatives.Any(cr => cr.UserId == userId);

            if (IsAlreadyRepresentative)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserAlreadyRepresentative,
                    DevMessage = "User is already a representative of this company."
                };
            }
            
            company.CompanyRepresentatives.Add(new CompanyRepresentative
            {
                UserId = userId,
                CompanyId = companyId
            });

            await _context.SaveChangesAsync();
            return null;
        }

        public async Task<ApiErrorResponseDTO?> DeleteCompanyAsync(int companyId, int userId)
        {
            if (!await IsUserCompanyRepresentativeAsync(userId, companyId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to delete this company."
                };
            }
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CompanyNotFound,
                    DevMessage = "Company not found."
                };
            }

            bool hasLinkedUsers = await _context.CompanyRepresentatives.AnyAsync(cr => cr.CompanyId == companyId) ||
                                  await _context.TrainingRecords.AnyAsync(tr => tr.CompanyId == companyId);

            if (hasLinkedUsers)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CompanyHasLinkedUsers,
                    DevMessage = "Cannot delete this company because it has linked users or training records."
                };
            }

            company.IsDeleted = true;
            await _context.SaveChangesAsync();
            return null;
        }

        public async Task<(List<CompanyStudentsListDto>? Data, ApiErrorResponseDTO? Error)> GetCompanyStudentsAsync(int companyId, int userId)
        {
            if (!await IsUserCompanyRepresentativeAsync(userId, companyId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to view students of this company."
                });
            }

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CompanyNotFound,
                    DevMessage = "Company not found."
                });
            }

            var students = await _context.TrainingRecords
                .Where(tr => tr.CompanyId == companyId && tr.Status == enTrainingStatus.Active)
                .Select(tr => new CompanyStudentsListDto
                {
                    StudentPublicId = tr.Student.User.PublicId,
                    StudentName = tr.Student.User.Name,
                    CollegeName = tr.Student.College.CollegeName,
                    Major = tr.Student.Major,
                    TrainingStatus = tr.Status
                })
                .ToListAsync();

            return (students, null);
        }

        public async Task<(StudentProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetStudentProfileAsync(Guid studentPublicId, int companyId)
        {
            var studentProfile = await _context.TrainingRecords
                .Where(tr => tr.Student.User.PublicId == studentPublicId && tr.CompanyId == companyId)
                .Select(tr => new StudentProfileResponseDto
                {
                    Id = tr.Student.User.PublicId,
                    Name = tr.Student.User.Name,
                    Username = tr.Student.User.Username,
                    CollegeName = tr.Student.College.CollegeName,
                    UniversityIdNumber = tr.Student.UniversityIdNumber,
                    Major = tr.Student.Major,
                    GPA = tr.Student.GPA,
                    Email = tr.Student.User.Email,
                    PhoneNumber = tr.Student.User.PhoneNumber,

                    ActiveTraining = new ActiveTrainingDto
                    {
                        Id = tr.Id,
                        CompanyName = tr.Company.CompanyName,
                        StartDate = tr.StartDate,
                        EndDate = tr.EndDate,
                        AcademicYear = tr.AcademicYear,
                        Semester = tr.Semester,
                        TrainingStatus = tr.Status
                    }
                })
                .FirstOrDefaultAsync();

            if (studentProfile == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student not found or you do not have permission to access this profile."
                });
            }

            return (studentProfile, null);
        }

        public async Task<(Guid? NewPublicId, ApiErrorResponseDTO? Error)> LinkCompanyStudentAsync(CreateTrainingRecordDto request, int companyId, int userId)
        {
            if (!await IsUserCompanyRepresentativeAsync(userId, companyId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to link students to this company."
                });
            }

            var user = await _context.StudentProfiles
                .Include(u => u.TrainingRecords)
                .FirstOrDefaultAsync(u => u.User.PublicId == request.StudentPublicId);

            if (user == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student user profile not found."
                });
            }

            var existingActiveTraining = user.TrainingRecords.FirstOrDefault(tr => tr.CompanyId == companyId && tr.Status == enTrainingStatus.Active);

            if (existingActiveTraining != null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.ExistingPendingRequest,
                    DevMessage = "This student is already actively training at your company."
                });
            }

            var trainingRecord = new TrainingRecord
            {
                StudentId = user.UserId,
                CompanyId = companyId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                AcademicYear = request.AcademicYear,
                Semester = request.Semester,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.TrainingRecords.Add(trainingRecord);
            await _context.SaveChangesAsync();

            return (trainingRecord.PublicId, null);
        }

        public async Task<ApiErrorResponseDTO?> UnlinkCompanyStudentAsync(Guid studentPublicId, int companyId, int userId)
        {
            if (!await IsUserCompanyRepresentativeAsync(userId, companyId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to unlink students from this company."
                };
            }

            var trainingRecord = await _context.TrainingRecords
                .FirstOrDefaultAsync(tr => tr.Student.User.PublicId == studentPublicId && tr.CompanyId == companyId && tr.Status == enTrainingStatus.Active);

            if (trainingRecord == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Active training record not found for this student at your company."
                };
            }

            trainingRecord.Status = enTrainingStatus.Terminated;
            await _context.SaveChangesAsync();

            return null;
        }

        private async Task<bool> IsUserCompanyRepresentativeAsync(int userId, int companyId)
        {
            var company = await _context.Companies
                .Include(c => c.CompanyRepresentatives)
                .FirstOrDefaultAsync(c => c.Id == companyId);
            if (company == null)
            {
                return false;
            }
            return company.CompanyRepresentatives.Any(r => r.UserId == userId);
        }
    }
}
