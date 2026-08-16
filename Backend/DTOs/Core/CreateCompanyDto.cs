using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Core
{
    public class CreateCompanyDto
    {
        [Required(ErrorMessage = "Company name is required")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid contact email format")]
        public string? ContactEmail { get; set; }
        [Required(ErrorMessage = "Company address is required")]
        public string Address { get; set; } = string.Empty;
    }
}
