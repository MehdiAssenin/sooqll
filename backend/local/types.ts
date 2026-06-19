export type SessionPayload = {
  userId: number;
};

export type PublicUser = {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
};
