using System;
using System.Collections.Generic;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Training;

namespace summer_training_app.DTOs.Dashboard
{
    public class StudentProfileResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string CollegeName { get; set; } = string.Empty;
        public string? UniversityIdNumber { get; set; }
        public string? Major { get; set; }
        public decimal? GPA { get; set; }

        // Active training details, if any
        public ActiveTrainingDto? ActiveTraining { get; set; }

        // public List<StudentReportSummaryDto>? Reports { get; set; }
    }
}
