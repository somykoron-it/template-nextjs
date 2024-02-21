interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const sendSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const sendErrorResponse = (statusCode: number, message: string): ApiResponse<null> => ({
  success: false,
  error: { message },
});
