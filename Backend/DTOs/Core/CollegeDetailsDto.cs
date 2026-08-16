using System;

namespace summer_training_app.DTOs.Core
{
    public class CollegeDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ContactEmail { get; set; }
        public string Address { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } 
        public bool IsActive { get; set; }

        public int TotalStudents { get; set; }
    }
}
