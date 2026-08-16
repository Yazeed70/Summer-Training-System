using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Core
{
    public class CreateCollegeDto
    {
        [Required(ErrorMessage = "College name is required")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid contact email format")]
        public string? ContactEmail { get; set; }

        public string? Address { get; set; }
    }
}
