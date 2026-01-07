// src/utils/auth.js
export const saveCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

const authUtils = { saveCurrentUser, getCurrentUser, logout };
export default authUtils;