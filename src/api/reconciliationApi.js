import axios from "./axios";

export const getIbkReconciliation = async (id) => {
  const { data } = await axios.get(`/ibk-reconciliation/${id}`);
  return data;
};

export const getIbkReconciliations = async (params) => {
  const { data } = await axios.get("/ibk-reconciliations", { params });
  return data;
};
export const getBcpReconciliation = async (id) => {
  const { data } = await axios.get(`/bcp-reconciliation/${id}`);
  return data;
};

export const getBcpReconciliations = async (params) => {
  const { data } = await axios.get("/bcp-reconciliations", { params });
  return data;
};

export const conciliationBcp = async (data) => {
  const { data: response } = await axios.post("/bcp-reconciliation", data);
  return response;
}

export const conciliationIbk = async (data) => {
  const { data: response } = await axios.post("/ibk-reconciliation", data);
  return response;
}

export const getallBcpReconciliations = async () => {
  const { data } = await axios.get("/reconciliationbcp");
  return data;
}

export const getallIbkReconciliations = async () => {
  const { data } = await axios.get("/reconciliationibk");
  return data;
}
