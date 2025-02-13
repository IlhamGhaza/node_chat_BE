export interface ApiResponse<T> {
    message: string;
    data: T | null;
}


export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
    message: message?? "Success",
    data : data ,
});

export const errorResponse = (error: string): ApiResponse<null> => ({
    message: error,
    data: null,
});