using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Training
{
    public class ActiveTrainingDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public enSemesterType Semester { get; set; }
        public enTrainingStatus TrainingStatus { get; set; }


        private DateOnly _today => DateOnly.FromDateTime(DateTime.UtcNow);
        public int DurationInWeeks => (int)Math.Ceiling((EndDate.DayNumber - StartDate.DayNumber) / 7.0);

        public int? CurrentWeek =>
            _today < StartDate
            ? null :
            (int)((_today.DayNumber - StartDate.DayNumber) / 7) + 1;
    }
}
