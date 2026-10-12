import type { ObjectId } from 'mongodb';
import type { Database } from './db';
import { hex } from './ids';
import type { ViewerContext } from './policy';

// Loads what the policy needs to know about one viewer: who they follow, who is blocked in either
// direction, and which communities they belong to. Three small indexed reads, run together.
export async function loadViewerContext(
  database: Database,
  viewerId: ObjectId,
): Promise<ViewerContext> {
  const [follows, blocks, memberships] = await Promise.all([
    database.follows.find({ followerId: viewerId }, { projection: { followeeId: 1 } }).toArray(),
    database.blocks
      .find({ $or: [{ blockerId: viewerId }, { blockedId: viewerId }] })
      .project<{ blockerId: ObjectId; blockedId: ObjectId }>({ blockerId: 1, blockedId: 1 })
      .toArray(),
    database.memberships.find({ userId: viewerId }, { projection: { communityId: 1 } }).toArray(),
  ]);

  const me = hex(viewerId);
  return {
    id: me,
    following: new Set(follows.map((follow) => hex(follow.followeeId))),
    blocked: new Set(
      blocks.map((block) =>
        hex(block.blockerId) === me ? hex(block.blockedId) : hex(block.blockerId),
      ),
    ),
    communities: new Set(memberships.map((membership) => hex(membership.communityId))),
  };
}
