namespace summer_training_app.DTOs.Dashboard
{
    public class PendingCompanyRequestDto
    {
        public int Id { get; set; } = 0;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string CreatedByUsername { get; set; } = string.Empty;
        public string? ContactEmail { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.MinValue;
    }
}