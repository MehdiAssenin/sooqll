import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import bcrypt from "bcryptjs";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserLastSignIn,
} from "../queries/users";
import type { PublicUser } from "./types";

function toPublicUser(user: {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role === "admin" ? "admin" : "user",
  };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserById(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw Errors.badRequest("An account with this email already exists.");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await createUser({
    email: input.email,
    passwordHash,
    name: input.name,
  });
  return user;
}

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw Errors.unauthorized("Invalid email or password.");
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw Errors.unauthorized("Invalid email or password.");
  }
  await updateUserLastSignIn(user.id);
  return user;
}

export async function createSessionCookie(c: Context, userId: number) {
  const token = await signSessionToken({ userId });
  const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
  setCookie(c, Session.cookieName, token, {
    ...cookieOpts,
    maxAge: Session.maxAgeMs / 1000,
  });
}

export { toPublicUser };
