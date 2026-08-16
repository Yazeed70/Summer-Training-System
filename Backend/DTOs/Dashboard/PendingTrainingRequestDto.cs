using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class PendingTrainingRequestDto
    {
        public Guid Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string? AcceptanceLetterPath { get; set; }
        public enRequestStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}