using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace summer_training_app.Entities.Enums
{
    public enum enQuestionType
    {
        Text = 1,
        MultipleChoice = 2,
        Checkbox = 3,
        Dropdown = 4,
        RatingScale = 5,
        Date = 6,
        Time = 7,
        FileUpload = 8,
        Boolean = 9,
    }
}