import axios from "./axios";

export const getMonthlyAmountSums = async () => {
  try {
    const response = await axios.get("/monthly-amount-sums");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getBcpDailyAmountsForChart = async (params = "") => {
  try {
    const response = await axios.get(`/bcp-daily-amounts${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getIbkDailyAmountsForChart = async (params = "") => {
  try {
    const response = await axios.get(`/ibk-daily-amounts${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getValidationSummaryAt = async (params = "") => {
  try {
    const response = await axios.get(`/at-daily-amounts${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getBcpValidationSummary = async (params = "") => {
  try {
    const response = await axios.get(`/bcp-validation-summary${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getIbkValidationSummary = async (params = "") => {
  try {
    const response = await axios.get(`/ibk-validation-summary${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getTotalItemsSummary = async (params = "") => {
  try {
    const response = await axios.get(`/total-items-summary${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
