import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { API_URL } from '../config/variables';
import { IAppContext, IAppContextFunctions } from '../types';
import actions from './actions';
import { initialState, reducer } from './reducerAndState';
import { IPlan } from '../types';

const AppContext = React.createContext<IAppContext>({} as IAppContext);

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response.status === 401) {
        logoutUser();
      }
      return Promise.reject(err);
    }
  );

  //
  // Auto adjust a timer every time an alert is displayed to clear it
  //

  useEffect(() => {
    setTimeout(() => {
      if (state.showAlert) dispatch({ type: actions.CLEAR_ALERT });
    }, 4000);
  }, [state.showAlert]);

  //
  // PUBLIC FUNCTIONS
  //

  const displayAlert = (alertText, alertType) => {
    dispatch({ type: actions.SHOW_ALERT, payload: { alertText, alertType } });
  };

  const clearAlertNoDelay = () => {
    dispatch({ type: actions.CLEAR_ALERT });
  };

  //
  // CUSTOMERS
  //

  const getCustomers = async () => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance({
        method: 'get',
        url: 'customers',
      });

      setTimeout(() => {
        dispatch({ type: actions.GET_CUSTOMERS_SUCCESS, payload: res.data });
      }, 500);
    } catch (err) {
      console.error(err.response);
      dispatch({ type: actions.GET_CUSTOMERS_ERROR, payload: { alertText: 'Falha ao obter clientes' } });
    }
  };

  const registerUser = async (user: { name: string; email: string; password: string }) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const createdUser = await axiosInstance.post('/customers', user);
      dispatch({ type: actions.REGISTER_CUSTOMER_SUCCESS, payload: { createdUser, alertText: 'Usuário criado com sucesso' } });
      await loginUser({ email: user.email, password: user.password });
    } catch (err) {
      console.error(err);
      dispatch({ type: actions.REGISTER_CUSTOMER_ERROR, payload: { alertText: err.response.data.message } });
      throw new Error('err.message');
    }
  };

  //
  // AUTH
  //

  const loginUser = async ({ email, password }) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { userId, userRole } = res.data;
      dispatch({ type: actions.LOGIN_USER_SUCCESS, payload: { userId, userRole, alertText: 'Usuário logado com sucesso!' } });
    } catch (err) {
      const alertText = err.response.data?.message || 'Tente novamente mais tarde. Estamos passando por problemas no servidor :(';
      dispatch({ type: actions.LOGIN_USER_ERROR, payload: { alertText } });
      throw new Error(err);
    }
  };

  const verifyAuth = async () => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.get('/auth');
      const { userId, userRole } = res.data;
      console.log(userId, userRole);
      dispatch({ type: actions.VERIFY_AUTH_SUCCESS, payload: { userId, userRole } });
    } catch (err) {
      dispatch({ type: actions.VERIFY_AUTH_ERROR });
    }
  };

  const logoutUser = async () => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      await axiosInstance.delete('/auth/logout');
      dispatch({ type: actions.LOGOUT_USER_SUCCESS, payload: { alertText: 'Usuário deslogado do sistema' } });
    } catch (err) {
      const alertText = err.response.data?.message || 'Tente novamente mais tarde. Estamos passando por problemas no servidor :(';
      dispatch({ type: actions.LOGOUT_USER_ERROR, payload: { alertText } });
      throw new Error(err);
    }
  };

  //
  // MODALITIES
  //

  const addModality = async (newModality: { name: string; active: boolean }) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.post('/modalities', newModality);
      const { modality } = res.data;
      dispatch({ type: actions.ADD_NEW_MODALITY_SUCCESS, payload: { modality } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível criar modalidade';
      dispatch({ type: actions.ADD_NEW_MODALITY_ERROR, payload: { alertText: errMsg } });
    }
  };

  const getModalities = async () => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.get('/modalities');
      const { modalities } = res.data;
      dispatch({ type: actions.GET_MODALITIES_SUCCESS, payload: { modalities } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível obter modalidades';
      dispatch({ type: actions.GET_MODALITIES_ERROR, payload: { alertText: errMsg } });
    }
  };

  const updateModality = async (newModality: { name: string; active: boolean }, id: string) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.patch(`/modalities/${id}`, newModality);
      const { modality } = res.data;
      dispatch({ type: actions.UPDATE_MODALITY_SUCCESS, payload: { modality } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível editar modalidade';
      dispatch({ type: actions.UPDATE_MODALITY_ERROR, payload: { alertText: errMsg } });
    }
  };

  const deleteModality = async (id: string) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      await axiosInstance.delete(`/modalities/${id}`);
      dispatch({ type: actions.DELETE_MODALITY_SUCCESS, payload: { id } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível excluir modalidade';
      dispatch({ type: actions.DELETE_MODALITY_ERROR, payload: { alertText: errMsg } });
    }
  };

  //
  // PLANS
  //

  const addPlan = async (newPlan: IPlan) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.post('/plans', newPlan);
      const { plan } = res.data;
      dispatch({ type: actions.ADD_NEW_PLAN_SUCCESS, payload: { plan } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível criar plano';
      dispatch({ type: actions.ADD_NEW_PLAN_ERROR, payload: { alertText: errMsg } });
    }
  };

  const getPlans = async () => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.get('/plans');
      const { plans } = res.data;
      dispatch({ type: actions.GET_PLANS_SUCCESS, payload: { plans } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível obter planos';
      dispatch({ type: actions.GET_PLANS_ERROR, payload: { alertText: errMsg } });
    }
  };

  const updatePlan = async (newPlan: IPlan) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      const res = await axiosInstance.patch(`/plans/${newPlan._id}`, newPlan);
      const { plan } = res.data;
      dispatch({ type: actions.UPDATE_PLAN_SUCCESS, payload: { plan } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível editar plano';
      dispatch({ type: actions.UPDATE_PLAN_ERROR, payload: { alertText: errMsg } });
    }
  };

  const deletePlan = async (id: string) => {
    dispatch({ type: actions.OPERATION_BEGIN });

    try {
      await axiosInstance.delete(`/modalities/${id}`);
      dispatch({ type: actions.DELETE_PLAN_SUCCESS, payload: { id } });
    } catch (err) {
      const errMsg = err.response?.data.message || 'Não foi possível excluir plano';
      dispatch({ type: actions.DELETE_PLAN_ERROR, payload: { alertText: errMsg } });
    }
  };

  const publicFunctions: IAppContextFunctions = {
    displayAlert,
    clearAlertNoDelay,
    getCustomers,
    loginUser,
    verifyAuth,
    logoutUser,
    registerUser,
    addModality,
    getModalities,
    updateModality,
    deleteModality,
    addPlan,
    getPlans,
    updatePlan,
    deletePlan,
  };

  return <AppContext.Provider value={{ ...state, ...publicFunctions }}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, initialState, useAppContext };