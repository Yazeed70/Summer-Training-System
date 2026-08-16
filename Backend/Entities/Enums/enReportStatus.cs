using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Enums
{
    public enum enReportStatus
    {
        Draft = 1,
        PendingCompanyReview = 2,
        PendingCollegeReview = 3,
        Completed = 4,
        Rejected = 6  
    }
}