using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class UpgradeRequestDetailsDto
    {
        public Guid Id { get; set; }
        public Guid StudentPublicId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string RequestedRole { get; set; } = string.Empty;
        public string? CollegeName { get; set; }
        public string? CompanyName { get; set; }
        public string OfficialEmail { get; set; } = string.Empty;
        public string ProofFilePath { get; set; } = string.Empty;
        public enRequestStatus Status { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByName { get; set; }
    }
}
