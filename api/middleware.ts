import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(roles: string[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

// Base authenticated procedure
export const authedQuery = t.procedure.use(requireAuth);

// Role-specific procedures
export const adminQuery = authedQuery.use(
  requireRole(["municipal_admin"])
);

export const barangayOperatorQuery = authedQuery.use(
  requireRole(["barangay_operator", "municipal_admin"])
);

export const biteCenterQuery = authedQuery.use(
  requireRole(["bite_center", "municipal_admin"])
);

export const vetClinicQuery = authedQuery.use(
  requireRole(["vet_clinic", "municipal_admin"])
);

export const petOwnerQuery = authedQuery.use(
  requireRole(["pet_owner", "barangay_operator", "municipal_admin"])
);
