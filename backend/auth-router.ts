import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  registerUser,
  loginUser,
  createSessionCookie,
  toPublicUser,
} from "./local/auth";
import { Errors } from "@contracts/errors";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => toPublicUser(opts.ctx.user!)),

  register: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await registerUser(input);
      await createSessionCookieHono(ctx, user.id);
      return toPublicUser(user);
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await loginUser(input);
      await createSessionCookieHono(ctx, user.id);
      return toPublicUser(user);
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});

// Helper: set session cookie from tRPC context (which only has raw Request)
async function createSessionCookieHono(
  ctx: { resHeaders: Headers; req: Request },
  userId: number,
) {
  // Reuse the local auth helper but we need a Hono Context for setCookie.
  // Since tRPC runs on fetch adapter (no Hono Context), build the cookie manually.
  const { signSessionToken } = await import("./local/session");
  const { getSessionCookieOptions } = await import("./lib/cookies");
  const { Session } = await import("@contracts/constants");
  const token = await signSessionToken({ userId });
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}
