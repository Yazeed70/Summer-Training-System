using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Dashboard
{
    public class AdminResetPasswordDto
    {
        [Required(ErrorMessage = "New password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
