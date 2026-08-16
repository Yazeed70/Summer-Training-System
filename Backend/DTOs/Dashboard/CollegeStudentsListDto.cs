namespace summer_training_app.DTOs.Dashboard
{
    public class CollegeStudentsListDto
    {
        public Guid PublicId { get; set; }
        public string StudentName { get; set; }
        public int CompletedReports { get; set; }
        public ActiveTrainingListDto? ActiveTraining {  get; set; }
    }
}
