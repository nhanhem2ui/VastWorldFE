export type ServiceResult<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
};