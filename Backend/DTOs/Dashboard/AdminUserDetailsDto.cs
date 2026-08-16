using System;

namespace summer_training_app.DTOs.Dashboard
{
    public class AdminUserDetailsDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CollegeName { get; set; }
        public string? CompanyName { get; set; }
    }
}
