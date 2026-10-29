import api from './api';

export const getUsuarios = async () => {
  const res = await api.get('/usuarios');
  return res.data;
};

export const crearProductorAdmin = async (userData) => {
  const res = await api.post('/usuarios/admin/crear', userData);
  return res.data;
};

export const cambiarEstadoUsuario = async (id, activo) => {
  const res = await api.put(`/usuarios/${id}/estado`, null, { params: { activo } });
  return res.data;
};

export const resetearPasswordUsuario = async (id, password) => {
  const res = await api.put(`/usuarios/${id}/password`, { password });
  return res.data;
};
