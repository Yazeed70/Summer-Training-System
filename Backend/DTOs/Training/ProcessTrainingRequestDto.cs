namespace summer_training_app.DTOs.Training
{
    public class ProcessTrainingRequestDto
    {
        public Guid RequestPublicId { get; set; }
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; } 
    }
}
