export const FLAGS = {
  APP_STORE_BUILD: "APP_STORE_BUILD",
};

// Get flag from process.env
export const flag = (flag: keyof typeof FLAGS) => {
  return process.env[flag];
};
