export enum enRoles {
  Student = 1,
  CompanyRep = 2,
  CollegeRep = 3,
  SuperAdmin = 4,
  BasicUser = 5
}

export enum enEvaluationPhase {
  CompanyEvaluation = 'CompanyEvaluation',
  CollegeEvaluation = 'CollegeEvaluation'
}

export enum enEvaluationScore {
  Poor = 'Poor',
  Fair = 'Fair',
  Good = 'Good',
  VeryGood = 'VeryGood',
  Excellent = 'Excellent'
}

export enum enQuestionType {
  Text = 'Text',
  MultipleChoice = 'MultipleChoice',
  Checkbox = 'Checkbox',
  Dropdown = 'Dropdown',
  RatingScale = 'RatingScale',
  Date = 'Date',
  Time = 'Time',
  FileUpload = 'FileUpload',
  Boolean = 'Boolean'
}

export enum enReportStatus {
  Draft = 'Draft',
  PendingCompanyReview = 'PendingCompanyReview',
  PendingCollegeReview = 'PendingCollegeReview',
  Completed = 'Completed',
  Rejected = 'Rejected'
}

export enum enRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Deleted = 'Deleted'
}

export enum enSemesterType {
  First = 'First',
  Second = 'Second',
  Summer = 'Summer'
}

export enum enTrainingStatus {
  NotStarted = 'NotStarted',
  Active = 'Active',
  Completed = 'Completed',
  Terminated = 'Terminated',
  Failed = 'Failed'
}
