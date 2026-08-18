namespace summer_training_app.Common.Constants
{
    public class ErrorCodes
    {
        // Errors related to users and authentication
        public const string UserNotFound = "USER_NOT_FOUND";
        public const string UserAlreadyExists = "USER_ALREADY_EXISTS";
        public const string UserInactive = "USER_INACTIVE";
        public const string CannotModifySuperAdmin = "CANNOT_MODIFY_SUPERADMIN";
        public const string UnauthorizedAccess = "UNAUTHORIZED_ACCESS";
        public const string CurrentPasswordRequired = "CURRENT_PASSWORD_REQUIRED";
        public const string InvalidCurrentPassword = "INVALID_CURRENT_PASSWORD";
        public const string AccessDenied = "ACCESS_DENIED";

        // Errors related to roles
        public const string InvalidRoleId = "INVALID_ROLE_ID";
        public const string InvalidRole = "INVALID_ROLE";
        public const string RoleNotFound = "ROLE_NOT_FOUND";
        public const string InvalidRequestedRole = "INVALID_REQUESTED_ROLE";

        // Errors related to Students
        public const string StudentAlreadyLinked = "STUDENT_ALREADY_LINKED";
        public const string NoPendingRequests = "NO_PENDING_REQUESTS";


        // Errors related to requests and approvals
        public const string RequestNotFound = "REQUEST_NOT_FOUND";
        public const string ExistingPendingRequest = "EXISTING_PENDING_REQUEST";


        // Errors related to files
        public const string InvalidFileType = "INVALID_FILE_TYPE";
        public const string FileTooLarge = "FILE_TOO_LARGE";
        public const string InvalidFileTypeOrTooLarge = "INVALID_FILE_TYPE_OR_TOO_LARGE";
        public const string FileNotFound = "FILE_NOT_FOUND";
        public const string InvalidProofFile = "INVALID_PROOF_FILE";
        public const string DocumentNotFound = "DOCUMENT_NOT_FOUND";
        public const string InvalidFilePath = "INVALID_FILE_PATH";

        // Errors related to training
        public const string TrainingRequestNotFound = "TRAINING_REQUEST_NOT_FOUND";
        public const string CompanyIdMissing = "COMPANY_ID_MISSING";
        public const string TrainingIsNotActive = "TRAINING_IS_NOT_ACTIVE";

        // Errors related to companies
        public const string InvalidCompanyId = "INVALID_COMPANY_ID";
        public const string InvalidCompanyName = "INVALID_COMPANY_NAME";
        public const string CompanyNotFound = "COMPANY_NOT_FOUND";
        public const string CompanyHasLinkedUsers = "COMPANY_HAS_LINKED_USERS";
        public const string UserAlreadyRepresentative = "USER_ALREADY_REPRESENTATIVE";
        public const string CompanyIsNotApproved = "COMPANY_IS_NOT_APPROVED";

        // Errors related to colleges
        public const string InvalidCollegeId = "INVALID_COLLEGE_ID";
        public const string InvalidCollegeName = "INVALID_COLLEGE_NAME";
        public const string CollegeNotFound = "COLLEGE_NOT_FOUND";
        public const string CollegeHasLinkedUsers = "COLLEGE_HAS_LINKED_USERS";
        public const string DuplicateCollegeName = "DUPLICATE_COLLEGE_NAME";

        // Errors related to Upgrade Requests
        public const string UpgradeRequestNotFound = "UPGRADE_REQUEST_NOT_FOUND";
        public const string UpgradeRequestAlreadyProcessed = "UPGRADE_REQUEST_ALREADY_PROCESSED";

        // Errors related to Reports and Templates
        public const string TemplateNotFound = "TEMPLATE_NOT_FOUND";
        public const string ReportAlreadySubmitted = "REPORT_ALREADY_SUBMITTED";
        public const string ReportAlreadyEvaluated = "REPORT_ALREADY_EVALUATED";
        public const string TemplateHasSubmissions = "TEMPLATE_HAS_SUBMISSIONS";
        public const string StudentReportNotFound = "STUDENT_REPORT_NOT_FOUND";
        public const string TemplateTitleMissing = "TEMPLATE_TITLE_MISSING";
        public const string TemplateQuestionsMissing = "TEMPLATE_QUESTIONS_MISSING";



        // Server Errors
        public const string InternalServerError = "INTERNAL_SERVER_ERROR";

        // Database Errors
        public const string DatabaseError = "DATABASE_ERROR";
    }
}
