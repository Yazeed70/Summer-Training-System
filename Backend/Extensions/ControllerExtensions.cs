using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Common.Constants;
using summer_training_app.Common.Results;

namespace summer_training_app.Extensions
{
    public static class ControllerExtensions
    {
        public static IActionResult ToProblemDetails(this ControllerBase controller, Error error)
        {
            if (error == null || error == Error.None)
            {
                return controller.Ok();
            }

            var (statusCode, title) = MapErrorToStatus(error);

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = error.Description,
                Instance = controller.HttpContext.Request.Path,
                Type = $"https://datatracker.ietf.org/doc/html/rfc9110#section-15.{(statusCode / 100 == 4 ? "5" : "6")}.{(statusCode % 100)}"
            };

            problemDetails.Extensions["code"] = error.Code;
            if (!string.IsNullOrWhiteSpace(error.Description))
            {
                problemDetails.Extensions["devMessage"] = error.Description;
            }

            return new ObjectResult(problemDetails)
            {
                StatusCode = statusCode,
                ContentTypes = { "application/problem+json" }
            };
        }

        public static IActionResult ToProblemDetails(this ControllerBase controller, Result result)
        {
            if (result.IsSuccess)
            {
                return controller.Ok();
            }

            return controller.ToProblemDetails(result.Error);
        }

        public static IActionResult ToProblemDetails<T>(this ControllerBase controller, Result<T> result)
        {
            if (result.IsSuccess)
            {
                return controller.Ok(result.Value);
            }

            return controller.ToProblemDetails(result.Error);
        }

        public static IActionResult UnauthorizedProblem(this ControllerBase controller, string detail = "User identity is invalid or missing.")
        {
            return controller.ToProblemDetails(Error.Unauthorized(ErrorCodes.UnauthorizedAccess, detail));
        }

        public static IActionResult ForbiddenProblem(this ControllerBase controller, string detail = "Access is forbidden.")
        {
            return controller.ToProblemDetails(Error.Forbidden(ErrorCodes.AccessDenied, detail));
        }

        private static (int StatusCode, string Title) MapErrorToStatus(Error error)
        {
            switch (error.Type)
            {
                case ErrorType.NotFound:
                    return (StatusCodes.Status404NotFound, "Not Found");
                case ErrorType.Unauthorized:
                    return (StatusCodes.Status401Unauthorized, "Unauthorized");
                case ErrorType.Forbidden:
                    return (StatusCodes.Status403Forbidden, "Forbidden");
                case ErrorType.Conflict:
                    return (StatusCodes.Status409Conflict, "Conflict");
                case ErrorType.Validation:
                    return (StatusCodes.Status400BadRequest, "Bad Request");
            }

            return error.Code switch
            {
                ErrorCodes.UserNotFound or
                ErrorCodes.RoleNotFound or
                ErrorCodes.RequestNotFound or
                ErrorCodes.FileNotFound or
                ErrorCodes.DocumentNotFound or
                ErrorCodes.TrainingRequestNotFound or
                ErrorCodes.CompanyNotFound or
                ErrorCodes.CollegeNotFound or
                ErrorCodes.UpgradeRequestNotFound or
                ErrorCodes.TemplateNotFound or
                ErrorCodes.StudentReportNotFound or
                ErrorCodes.NoPendingRequests => (StatusCodes.Status404NotFound, "Not Found"),

                ErrorCodes.UserInactive => (StatusCodes.Status401Unauthorized, "Unauthorized"),

                ErrorCodes.UnauthorizedAccess or
                ErrorCodes.AccessDenied or
                ErrorCodes.CannotModifySuperAdmin => (StatusCodes.Status403Forbidden, "Forbidden"),

                ErrorCodes.DatabaseError or
                ErrorCodes.InternalServerError => (StatusCodes.Status500InternalServerError, "Internal Server Error"),

                _ => (StatusCodes.Status400BadRequest, "Bad Request")
            };
        }
    }
}
