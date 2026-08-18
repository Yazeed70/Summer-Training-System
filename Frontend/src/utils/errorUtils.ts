import i18n from '../i18n';
import { ProblemDetails } from '../types/api';

export interface FormattedApiError {
  title: string;
  message: string;
  errorCode?: string;
  traceId?: string;
  status?: number;
  validationErrors?: string[];
  isValidationError?: boolean;
}

// Comprehensive localized messages mapped to backend ErrorCodes
const ERROR_CODE_MESSAGES: Record<string, { ar: string; en: string; titleAr?: string; titleEn?: string }> = {
  // Authentication & Users
  INVALID_CREDENTIALS: {
    ar: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات المدخلة وإعادة المحاولة.',
    en: 'Invalid username or password. Please verify your credentials and try again.',
    titleAr: 'خطأ في تسجيل الدخول',
    titleEn: 'Authentication Failed',
  },
  USER_NOT_FOUND: {
    ar: 'لم يتم العثور على حساب المستخدم المطلوب في النظام.',
    en: 'The requested user account was not found in the system.',
  },
  USER_ALREADY_EXISTS: {
    ar: 'يوجد حساب مسجل مسبقاً بنفس بيانات الهوية أو اسم المستخدم أو البريد الإلكتروني.',
    en: 'An account with this username, National ID, or email already exists.',
  },
  USER_INACTIVE: {
    ar: 'هذا الحساب غير نشط حالياً. يرجى التواصل مع إدارة النظام لتفعيل الحساب.',
    en: 'This account is currently inactive. Please contact the administrator for activation.',
    titleAr: 'الحساب غير مفعّل',
    titleEn: 'Account Inactive',
  },
  CANNOT_MODIFY_SUPERADMIN: {
    ar: 'لا يمكن تعديل أو تعطيل حساب المشرف العام الرئيسي للنظام.',
    en: 'The Super Administrator account cannot be modified or deactivated.',
  },
  UNAUTHORIZED_ACCESS: {
    ar: 'ليس لديك الصلاحيات الكافية للوصول إلى هذا المورد أو تنفيذ هذا الإجراء.',
    en: 'You do not have sufficient permissions to access this resource or perform this action.',
    titleAr: 'غير مصرح',
    titleEn: 'Access Denied',
  },
  ACCESS_DENIED: {
    ar: 'تم رفض الوصول. ليس لديك الصلاحية المناسبة للقيام بهذه العملية.',
    en: 'Access denied. You do not have permission to execute this operation.',
    titleAr: 'تم رفض الوصول',
    titleEn: 'Access Denied',
  },
  CURRENT_PASSWORD_REQUIRED: {
    ar: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغييرات.',
    en: 'Please enter your current password to confirm changes.',
  },
  INVALID_CURRENT_PASSWORD: {
    ar: 'كلمة المرور الحالية التي أدخلتها غير صحيحة.',
    en: 'The current password you entered is incorrect.',
  },

  // Roles
  INVALID_ROLE_ID: {
    ar: 'معرف الدور المحدد غير صالح.',
    en: 'The specified role ID is invalid.',
  },
  INVALID_ROLE: {
    ar: 'نوع الدور غير معتمد في النظام.',
    en: 'The specified role is not recognized in the system.',
  },
  ROLE_NOT_FOUND: {
    ar: 'الدور المطلوب غير موجود.',
    en: 'The requested role was not found.',
  },
  INVALID_REQUESTED_ROLE: {
    ar: 'طلب الترقية للدور المحدد غير متاح أو غير مسموح به.',
    en: 'The requested role upgrade is not permitted or unavailable.',
  },

  // Students & Training
  STUDENT_ALREADY_LINKED: {
    ar: 'هذا الطالب مسجل ومرتبط بالفعل بجهة تدريبية نشطة.',
    en: 'This student is already linked to an active training entity.',
  },
  NO_PENDING_REQUESTS: {
    ar: 'لا توجد طلبات معلقة حالياً لمعالجتها.',
    en: 'There are no pending requests available at this time.',
  },
  REQUEST_NOT_FOUND: {
    ar: 'لم يتم العثور على الطلب المطلوب في السجلات.',
    en: 'The requested training request was not found in records.',
  },
  TRAINING_REQUEST_NOT_FOUND: {
    ar: 'طلب التدريب المحدد غير موجود أو ربما تم حذفه.',
    en: 'The specified training request was not found or may have been deleted.',
  },
  EXISTING_PENDING_REQUEST: {
    ar: 'لديك طلب تدريب قيد المراجعة بالفعل. لا يمكن إرسال طلب جديد حتى تتم معالجة طلبك الحالي.',
    en: 'You already have a pending training request. You cannot submit a new request until your current one is processed.',
    titleAr: 'يوجد طلب معلق',
    titleEn: 'Existing Pending Request',
  },
  COMPANY_ID_MISSING: {
    ar: 'يرجى اختيار جهة التدريب (الشركة) أولاً للمتابعة.',
    en: 'Please select a company to proceed.',
  },
  TRAINING_IS_NOT_ACTIVE: {
    ar: 'فترة التدريب ليست نشطة حالياً لإتمام هذا الإجراء.',
    en: 'The training period is not currently active for this action.',
  },

  // Files & Documents
  INVALID_FILE_TYPE: {
    ar: 'نوع الملف غير مدعوم. يرجى رفع ملف بصيغة مدعومة مثل PDF أو JPG أو PNG.',
    en: 'Unsupported file format. Please upload an accepted format such as PDF, JPG, or PNG.',
  },
  FILE_TOO_LARGE: {
    ar: 'حجم الملف المرفوع يتجاوز الحد الأقصى المسموح به.',
    en: 'The uploaded file exceeds the maximum allowed size limit.',
  },
  INVALID_FILE_TYPE_OR_TOO_LARGE: {
    ar: 'نوع الملف غير مدعوم أو أن حجمه يتجاوز الحد المسموح به.',
    en: 'Unsupported file type or file size exceeds the allowed limit.',
  },
  FILE_NOT_FOUND: {
    ar: 'الملف المطلوب غير موجود في الخادم.',
    en: 'The requested file was not found on the server.',
  },
  INVALID_PROOF_FILE: {
    ar: 'مستند الإثبات المرفق غير صالح أو غير مكتمل.',
    en: 'The provided proof document is invalid or incomplete.',
  },
  DOCUMENT_NOT_FOUND: {
    ar: 'المستند المطلوب غير موجود.',
    en: 'The requested document was not found.',
  },
  INVALID_FILE_PATH: {
    ar: 'مسار الملف المحدد غير صالح.',
    en: 'The specified file path is invalid.',
  },

  // Companies & Colleges
  INVALID_COMPANY_ID: {
    ar: 'معرف الشركة المحدد غير صالح.',
    en: 'The specified company ID is invalid.',
  },
  INVALID_COMPANY_NAME: {
    ar: 'اسم الشركة غير صالح أو فارغ.',
    en: 'The company name is invalid or empty.',
  },
  COMPANY_NOT_FOUND: {
    ar: 'لم يتم العثور على بيانات الشركة المحددة.',
    en: 'The specified company was not found.',
  },
  COMPANY_HAS_LINKED_USERS: {
    ar: 'لا يمكن حذف هذه الشركة لأنها مرتبطة بمستخدمين أو متدربين حاليين.',
    en: 'Cannot delete this company because it is currently linked to active users or trainees.',
  },
  USER_ALREADY_REPRESENTATIVE: {
    ar: 'هذا المستخدم مسجل بالفعل كممثل لجهة تدريبية.',
    en: 'This user is already registered as a company representative.',
  },
  INVALID_COLLEGE_ID: {
    ar: 'معرف الكلية المحدد غير صالح.',
    en: 'The specified college ID is invalid.',
  },
  INVALID_COLLEGE_NAME: {
    ar: 'اسم الكلية غير صالح أو فارغ.',
    en: 'The college name is invalid or empty.',
  },
  COLLEGE_NOT_FOUND: {
    ar: 'لم يتم العثور على بيانات الكلية المحددة.',
    en: 'The specified college was not found.',
  },
  COLLEGE_HAS_LINKED_USERS: {
    ar: 'لا يمكن حذف هذه الكلية لأنها مرتبطة بمشرفين وطلاب مسجلين.',
    en: 'Cannot delete this college because it is currently linked to supervisors and students.',
  },
  DUPLICATE_COLLEGE_NAME: {
    ar: 'اسم الكلية موجود بالفعل مسبقاً.',
    en: 'A college with this name already exists.',
  },

  // Upgrade Requests
  UPGRADE_REQUEST_NOT_FOUND: {
    ar: 'طلب ترقية الحساب المحدد غير موجود.',
    en: 'The specified upgrade request was not found.',
  },
  UPGRADE_REQUEST_ALREADY_PROCESSED: {
    ar: 'تمت معالجة هذا الطلب سابقاً ولا يمكن إعادة اتخاذ إجراء بشأنه.',
    en: 'This upgrade request has already been processed.',
  },

  // Reports & Templates
  TEMPLATE_NOT_FOUND: {
    ar: 'نموذج التقرير المطلوب غير موجود.',
    en: 'The requested report template was not found.',
  },
  REPORT_ALREADY_SUBMITTED: {
    ar: 'لقد تم إرسال هذا التقرير مسبقاً ولا يمكن إرساله مرة أخرى.',
    en: 'This report has already been submitted.',
  },
  TEMPLATE_HAS_SUBMISSIONS: {
    ar: 'لا يمكن حذف هذا النموذج لوجود تقارير طلابية مرسلة ومرتبطة به.',
    en: 'Cannot delete this template because students have already submitted reports for it.',
  },
  STUDENT_REPORT_NOT_FOUND: {
    ar: 'تقرير الطالب المطلوب غير موجود.',
    en: 'The requested student report was not found.',
  },
  TEMPLATE_TITLE_MISSING: {
    ar: 'عنوان نموذج التقرير مطلوب.',
    en: 'Template title is required.',
  },
  TEMPLATE_QUESTIONS_MISSING: {
    ar: 'يجب إضافة سؤال واحد على الأقل داخل نموذج التقرير.',
    en: 'The template must include at least one question.',
  },

  // Server & Database
  INTERNAL_SERVER_ERROR: {
    ar: 'حدث خطأ غير متوقع في الخادم أثناء معالجة طلبك. نعتذر عن الإزعاج، يرجى المحاولة لاحقاً.',
    en: 'An unexpected server error occurred while processing your request. Please try again later.',
    titleAr: 'خطأ غير متوقع',
    titleEn: 'Unexpected Server Error',
  },
  DATABASE_ERROR: {
    ar: 'حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة بعد قليل.',
    en: 'A database error occurred. Please try again shortly.',
    titleAr: 'خطأ في قاعدة البيانات',
    titleEn: 'Database Error',
  },
};

/**
 * Extracts and formats a user-friendly error object from any Axios / API error
 */
export function formatApiError(error: any): FormattedApiError {
  const isArabic = (i18n.language || 'ar').startsWith('ar');
  const response = error?.response;
  const data = (response?.data || {}) as ProblemDetails;
  const status = response?.status || (error?.status as number | undefined);

  // Check if standard RFC 7807 validation errors dictionary exists
  const validationErrorsMap = data?.errors;
  let validationErrorsList: string[] = [];
  if (validationErrorsMap && typeof validationErrorsMap === 'object') {
    Object.values(validationErrorsMap).forEach((messages) => {
      if (Array.isArray(messages)) {
        validationErrorsList.push(...messages);
      } else if (typeof messages === 'string') {
        validationErrorsList.push(messages);
      }
    });
  }

  const isValidationError =
    status === 400 && validationErrorsList.length > 0;

  // Extract error code (new RFC 7807 errorCode or legacy code)
  const errorCode = data?.errorCode || data?.code;
  const traceId = data?.traceId;

  // Determine user friendly title
  let title = isArabic ? 'تنبيه' : 'Notice';

  if (status === 401) {
    title = isArabic ? 'انتهت الجلسة' : 'Session Expired';
  } else if (status === 403) {
    title = isArabic ? 'غير مصرح بالوصول' : 'Access Denied';
  } else if (status === 404) {
    title = isArabic ? 'العنصر غير موجود' : 'Not Found';
  } else if (status === 409) {
    title = isArabic ? 'تعارض في البيانات' : 'Conflict';
  } else if (status === 500) {
    title = isArabic ? 'خطأ في النظام' : 'System Error';
  } else if (data?.title) {
    title = data.title;
  }

  // Determine localized message
  let message = '';

  // 1. If we have a known backend errorCode, use its friendly localized mapping
  if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
    const item = ERROR_CODE_MESSAGES[errorCode];
    message = isArabic ? item.ar : item.en;
    if (isArabic && item.titleAr) title = item.titleAr;
    if (!isArabic && item.titleEn) title = item.titleEn;
  }
  // 2. Otherwise use the RFC 7807 detail string if present
  else if (data?.detail && typeof data.detail === 'string') {
    message = data.detail;
  }
  // 3. Backward-compatibility fallbacks (devMessage or message)
  else if (data?.devMessage && typeof data.devMessage === 'string') {
    message = data.devMessage;
  } else if (data?.message && typeof data.message === 'string') {
    message = data.message;
  }
  // 4. If string response directly
  else if (typeof response?.data === 'string' && response.data.trim()) {
    message = response.data;
  }
  // 5. Handle Network Error
  else if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    title = isArabic ? 'تعذر الاتصال بالخادم' : 'Connection Error';
    message = isArabic
      ? 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.'
      : 'Please check your internet connection and try again.';
  }
  // 6. Handle HTTP Status fallback defaults
  else if (status === 500) {
    message = isArabic
      ? 'حدث خطأ داخلي في الخادم. يرجى تزويد الدعم الفني برمز التتبع إذا استمرت المشكلة.'
      : 'An internal server error occurred. Please contact technical support with the trace ID.';
  } else if (status === 403) {
    message = isArabic
      ? 'ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء.'
      : 'You do not have permission to perform this action.';
  } else if (status === 404) {
    message = isArabic
      ? 'تعذر العثور على البيانات المطلوبة.'
      : 'The requested resource could not be found.';
  } else if (error?.message) {
    message = error.message;
  } else {
    message = isArabic
      ? 'حدث خطأ غير متوقع أثناء معالجة طلبك. يرجى المحاولة مجدداً.'
      : 'An unexpected error occurred. Please try again.';
  }

  return {
    title,
    message,
    errorCode,
    traceId,
    status,
    validationErrors: validationErrorsList,
    isValidationError,
  };
}

/**
 * Convenient helper to extract single message string from an error
 */
export function getErrorMessage(error: any): string {
  const formatted = formatApiError(error);
  if (formatted.validationErrors && formatted.validationErrors.length > 0) {
    return formatted.validationErrors[0];
  }
  return formatted.message;
}
