// utils/validators.ts
export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};
