import axios from "./axios";

export const getAt = async (id) => {
  const { data } = await axios.get(`/at/${id}`);
  return data;
};

export const getAts = async (params) => {
  const { data } = await axios.get('/ats', { params });
  return data;
};

export const changeStatus = async (id) => {
  const { data } = await axios.put(`/at/${id}`);
  return data;
};

export const addObservations = async (id, observations) => {
  const { data } = await axios.put(`/at/${id}/observations`, { observations });
  return data;
};

export const updatedAt = async (id, operation_number) => {
  const { data } = await axios.put(`/at/${id}/operationnumber`, { operation_number });
  return data;
}