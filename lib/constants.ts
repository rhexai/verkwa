export const PRIMARY_SUPERADMIN_EMAIL = "flowboard.team@gmail.com";

export const isPrimarySuperadmin = (email: string | undefined) => {
  return email === PRIMARY_SUPERADMIN_EMAIL;
};
