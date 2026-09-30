export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  mine: () => [...bookingKeys.lists(), "mine"] as const,
  host: () => [...bookingKeys.lists(), "host"] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  mutations: () => [...bookingKeys.all, "mutation"] as const,
  create: () => [...bookingKeys.mutations(), "create"] as const,
  actions: () => [...bookingKeys.mutations(), "action"] as const,
};