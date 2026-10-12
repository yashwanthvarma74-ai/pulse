import { deflateSync } from 'node:zlib';
import { expect, test } from '@playwright/test';
import { openLatest, signInAs, uniqueText } from './helpers';

// A real PNG, built in the test: a solid-colour image of the given size.
function png(width: number, height: number): Buffer {
  const crc = (buf: Buffer) => {
    let c = ~0;
    for (const byte of buf) {
      c ^= byte;
      for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
    return ~c >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0x6b)]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

test('a photo is processed in the background, posted, and shown only to people who can see the post', async ({
  browser,
}) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');
  const carol = await signInAs(browser, 'carol');

  const text = uniqueText('A photo for my followers');
  await alice.page.getByRole('textbox', { name: 'What is on your mind?' }).fill(text);
  await alice.page
    .getByRole('combobox', { name: 'Who can see this' })
    .selectOption({ label: 'Followers only' });
  await alice.page
    .getByLabel('Choose images')
    .setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png(900, 600) });

  // processing happens in the worker; the preview appears when it is ready and only then can she post
  await expect(
    alice.page.getByRole('list', { name: 'Attached images' }).getByRole('img'),
  ).toBeVisible();
  await alice.page.getByRole('button', { name: 'Post', exact: true }).click();
  await expect(alice.page.getByRole('textbox', { name: 'What is on your mind?' })).toHaveValue('');

  // Bob follows Alice and sees the image, fully loaded
  await openLatest(bob.page);
  const image = bob.page
    .getByRole('article')
    .filter({ hasText: text })
    .getByRole('img', { name: /Attached to Alice Nguyen/ });
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);

  // the image URL itself is protected: Carol cannot fetch it even with the address
  const src = await image.getAttribute('src');
  expect((await bob.page.request.get(src!)).status()).toBe(200);
  expect((await carol.page.request.get(src!)).status()).toBe(404);

  for (const person of [alice, bob, carol]) await person.context.close();
});

test('something that is not an image is refused with a clear message', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  await alice.page.getByLabel('Choose images').setInputFiles({
    name: 'notes.png',
    mimeType: 'image/png',
    buffer: Buffer.from('definitely not an image'),
  });
  await expect(alice.page.getByText('That file is not an image we can read.')).toBeVisible();
  await alice.context.close();
});
