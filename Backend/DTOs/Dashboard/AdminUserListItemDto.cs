using System;

namespace summer_training_app.DTOs.Dashboard
{
    public class AdminUserListItemDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? CollegeName { get; set; }
        public string? CompanyName { get; set; }

        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
