import { ObjectId } from 'mongodb';
import type { Core } from './core';
import { isDuplicateKey } from './db';
import { enqueueEvent, eventIds } from './events';
import { hex } from './ids';
import type { ViewerContext } from './policy';
import { getVisiblePost } from './posts';

export interface ReactionState {
  reactions: number;
  reacted: boolean;
}

// Reacting needs the right to see the post, so a reaction cannot be used to probe for one.
export async function addReaction(
  core: Core,
  viewer: ViewerContext,
  postId: ObjectId,
): Promise<ReactionState> {
  const post = await getVisiblePost(core, viewer, postId);
  const userId = new ObjectId(viewer.id);

  let inserted = true;
  try {
    await core.database.reactions.insertOne({
      _id: new ObjectId(),
      postId,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    inserted = false;
  }

  let reactions = post.reactionCount;
  if (inserted) {
    const updated = await core.database.posts.findOneAndUpdate(
      { _id: postId },
      { $inc: { reactionCount: 1 } },
      { returnDocument: 'after', projection: { reactionCount: 1 } },
    );
    reactions = updated?.reactionCount ?? reactions + 1;
    await enqueueEvent(core.queues, {
      type: 'reaction_added',
      eventId: eventIds.reactionAdded(hex(postId), viewer.id),
      postId: hex(postId),
      userId: viewer.id,
      emittedAt: Date.now(),
    }).catch((error: Error) =>
      core.logger.warn({ err: error.message }, 'could not queue reaction event'),
    );
  }
  return { reactions, reacted: true };
}

export async function removeReaction(
  core: Core,
  viewer: ViewerContext,
  postId: ObjectId,
): Promise<ReactionState> {
  const post = await getVisiblePost(core, viewer, postId);
  const result = await core.database.reactions.deleteOne({
    postId,
    userId: new ObjectId(viewer.id),
  });
  let reactions = post.reactionCount;
  if (result.deletedCount > 0) {
    const updated = await core.database.posts.findOneAndUpdate(
      { _id: postId },
      { $inc: { reactionCount: -1 } },
      { returnDocument: 'after', projection: { reactionCount: 1 } },
    );
    reactions = updated?.reactionCount ?? Math.max(0, reactions - 1);
  }
  return { reactions, reacted: false };
}
