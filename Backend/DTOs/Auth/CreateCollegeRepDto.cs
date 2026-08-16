using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Auth
{
    public class CreateCollegeRepDto
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirm Password is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "College Name is required")]
        public string CollegeName { get; set; } = string.Empty;
        public string? JobTitle { get; set; } = string.Empty;
        public string? Department { get; set; } = string.Empty;
    }
}
