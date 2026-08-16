using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class UpgradeRequestsListDto
    {
        public Guid Id { get; set; }
        public Guid UserPublicId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string RequestedRole { get; set; } = string.Empty;
        public string? CollegeName { get; set; }
        public string? CompanyName { get; set; }
        public enRequestStatus Status { get; set; }
        public string FilePath { get; set; }
    }
}
