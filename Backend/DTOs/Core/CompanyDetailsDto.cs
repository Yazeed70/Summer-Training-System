using System;

namespace summer_training_app.DTOs.Core
{
    public class CompanyDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ContactEmail { get; set; }
        public string Address { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public string? CreatedByUserName { get; set; } = null;
        public DateTime? ApprovedAt { get; set; } = null;

        public int TotalStudents { get; set; }
    }
}
