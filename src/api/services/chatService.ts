import axios, { AxiosError } from "axios";
import axiosInstance from "../axiosInstance";
import { ChatRequest, ChatResponse, ApiError } from "../../types/api";

/**
 * Sends a chat message to the API.
 * @param requestPayload - The chat request payload.
 * @returns A promise that resolves to the chat response.
 */
export const sendChatMessage = async (requestPayload: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await axiosInstance.post<ChatResponse>("/api/ai/chat", requestPayload);
    return response.data;
  } catch (error) {
    let apiError: ApiError;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      apiError = {
        message: axiosError.response?.data?.message || "An unexpected API error occurred",
        status: axiosError.response?.status,
        details: axiosError.response?.data?.details || axiosError.message,
      };
    } else {
      apiError = {
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      };
    }
    throw apiError;
  }
};
