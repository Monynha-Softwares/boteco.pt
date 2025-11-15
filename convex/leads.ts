import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    pageUrl: v.optional(v.string()),
  },
  returns: v.id('leads'),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('leads', {
      name: args.name,
      email: args.email,
      message: args.message,
      // `pageUrl` is optional in the validator and expects `string | undefined`.
      // Use `undefined` when absent rather than `null` to match the Convex schema.
      pageUrl: args.pageUrl ?? undefined,
      // Convex expects int64 as `bigint` for timestamps. Convert with `BigInt`.
      createdAt: BigInt(Date.now()),
    });
    return id;
  },
});
