namespace summer_training_app.DTOs.Dashboard
{
    public class CollegesListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public int TotalStudents { get; set; }
    }
}
