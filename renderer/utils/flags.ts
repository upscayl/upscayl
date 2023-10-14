export const FLAGS = {
  IS_APPLE_STORE_BUILD: "IS_APPLE_STORE_BUILD",
};

// Get flag from process.env
export const flag = (flag: keyof typeof FLAGS) => {
  return process.env[flag];
};
