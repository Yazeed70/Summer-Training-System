using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class ActiveTrainingListDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; }
        public enTrainingStatus TrainingStatus { get; set; }
    }
}
