using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Training
{
    public class UpdateTrainingStatusDto
    {
        public Guid TrainingPublicId { get; set; }
        public enTrainingStatus NewStatus { get; set; }
    }
}
