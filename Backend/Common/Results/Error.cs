namespace summer_training_app.Common.Results
{
    public record Error
    {
        public string Code { get; init; }
        public string Description { get; init; }
        public ErrorType Type { get; init; }

        public Error(string code, string description, ErrorType type = ErrorType.Failure)
        {
            Code = code;
            Description = description;
            Type = type;
        }

        public static readonly Error None = new(string.Empty, string.Empty, ErrorType.Failure);

        public static Error Failure(string code, string description) =>
            new(code, description, ErrorType.Failure);

        public static Error Validation(string code, string description) =>
            new(code, description, ErrorType.Validation);

        public static Error NotFound(string code, string description) =>
            new(code, description, ErrorType.NotFound);

        public static Error Conflict(string code, string description) =>
            new(code, description, ErrorType.Conflict);

        public static Error Forbidden(string code, string description) =>
            new(code, description, ErrorType.Forbidden);

        public static Error Unauthorized(string code, string description) =>
            new(code, description, ErrorType.Unauthorized);

        public static implicit operator Error((string Code, string Description) tuple) =>
            new(tuple.Code, tuple.Description, ErrorType.Failure);
    }
}
