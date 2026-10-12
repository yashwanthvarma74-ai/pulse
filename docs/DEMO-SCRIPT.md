# Demo script (60 to 90 seconds)

Lead with the hard part, not the home page. Record at 1080p, no music, captions on. This is the script; the video
itself is not recorded yet.

**Setup:** `npm run seed`, `npm run dev`, open <http://localhost:3000>, press **Continue as guest** once so the
landing page is out of the way, then sign out from the account menu.

| Time | What is on screen                                                                                                                                                         | What to say                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 0:00 | The landing page, the demo accounts listed with their roles.                                                                                                              | "Pulse is a feed that has to stay fast, correct and private. Let me show each of those."                          |
| 0:10 | **1. Three accounts.** Sign in as Alice, post "Surprise party on Saturday" as _Followers only_. Switch to Bob, Carol, Dan from the account menu, open **Latest** in each. | "Alice posts once. Bob follows her and sees it. Carol does not. Dan is blocked, so Alice does not exist for him." |
| 0:35 | As Bob, **More, Why am I seeing this?**                                                                                                                                   | "And it can say why: this is stored from the ranking, not invented afterwards."                                   |
| 0:45 | **2. Scroll 10,000 posts.** Open the General community, scroll hard. Show the DOM (about 18 posts) in DevTools and the FPS meter.                                         | "Ten thousand posts, eighteen in the page, sixty frames a second."                                                |
| 1:00 | **3. New posts.** Two windows, Alice posts, the **1 new post** pill appears on Bob's screen, the feed does not move, click it.                                            | "A new post never moves the feed under you."                                                                      |
| 1:10 | **4. Replay the queue.** Show the test output of `handlers.test.ts` (one notification after three replays).                                                               | "The queue can deliver twice. The notification is sent once."                                                     |
| 1:20 | **5. Before and after.** The Lighthouse table and a failing `npm run size`.                                                                                               | "Lighthouse, and a bundle budget that fails a pull request that makes a page heavier."                            |
