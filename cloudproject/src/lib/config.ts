export const getConfig = () => {
  const NODE_ENV = process.env.NODE_ENV || "development";
  const JWT_SECRET = process.env.JWT_SECRET;
  const COOKIE_SECURE = (process.env.COOKIE_SECURE === "true") || NODE_ENV === "production";
  const SECURE_HEADERS = (process.env.SECURE_HEADERS !== "false");

  if (NODE_ENV === "production") {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is required in production environment");
    }
  }

  return {
    NODE_ENV,
    JWT_SECRET: JWT_SECRET || "",
    COOKIE_SECURE,
    SECURE_HEADERS,
  } as const;
};

export type AppConfig = ReturnType<typeof getConfig>;
