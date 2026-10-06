import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Manus login is gone on Railway. The flyer tool is open to managers, so every
 * visitor acts as one shared account. Photos uploaded by anyone can be removed
 * by anyone.
 */
export const SHARED_USER_OPEN_ID = "shared";

const sharedUser: User = {
  id: 0,
  openId: SHARED_USER_OPEN_ID,
  name: "ApartmentCorp",
  email: null,
  loginMethod: "shared",
  role: "admin",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return { req: opts.req, res: opts.res, user: sharedUser };
}
