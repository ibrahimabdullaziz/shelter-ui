export const authQueryKeys = {
  all: ["auth"] as const,
  currentUser: ["auth", "currentUser"] as const,
  mutations: ["auth", "mutation"] as const,
  login: ["auth", "mutation", "login"] as const,
  register: ["auth", "mutation", "register"] as const,
  logout: ["auth", "mutation", "logout"] as const,
};
