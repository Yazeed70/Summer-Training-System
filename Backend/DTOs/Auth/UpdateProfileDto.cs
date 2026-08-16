namespace summer_training_app.DTOs.Auth
{
    public class UpdateProfileDto
    {
        public string Name { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
