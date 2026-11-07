import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import { ZipArchive } from 'archiver';
import { insertUserSchema, insertPhotoSchema } from '../shared/schema';

test('patched Zod works with Drizzle-generated insert validation', () => {
  const user = insertUserSchema.parse({ telegramId: 123456, referralCode: 'TESTCODE', firstName: 'Test', id: 999 });
  assert.equal(user.telegramId, 123456);
  assert.equal('id' in user, false);
  const invalid = insertUserSchema.safeParse({ telegramId: 'spoofed', referralCode: 'TESTCODE' });
  assert.equal(invalid.success, false);
  if (!invalid.success) assert.ok(invalid.error.issues.some(issue => issue.path[0] === 'telegramId'));
  assert.equal(insertPhotoSchema.safeParse({}).success, false);
  assert.deepEqual(z.record(z.string(), z.unknown()).parse({ product: 123 }), { product: 123 });
});

test('form resolver accepts valid Zod 4 data and returns field errors', async () => {
  const resolver = zodResolver(z.object({ title: z.string().min(1) }));
  const options = { fields: {}, shouldUseNativeValidation: false } as const;
  const valid = await resolver({ title: 'Project' }, undefined, options);
  assert.deepEqual(valid.values, { title: 'Project' });
  const invalid = await resolver({ title: '' }, undefined, options);
  assert.equal(invalid.errors.title?.type, 'too_small');
});

test('storage SDK retains the file API used by object storage without a network call', () => {
  const storage = new Storage({ projectId: 'offline-security-test' });
  const file = storage.bucket('offline-test-bucket').file('private/example.webp');
  assert.equal(file.name, 'private/example.webp');
  assert.equal(typeof file.getMetadata, 'function');
  assert.equal(typeof file.setMetadata, 'function');
  assert.equal(typeof file.createReadStream, 'function');
});

test('patched sharp native binary can decode and encode an image', async () => {
  const png = await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } } }).png().toBuffer();
  const output = await sharp(png).resize(1, 1).webp().toBuffer();
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 1);
  assert.equal(metadata.hasAlpha, true);
});

test('archive directory traversal works with patched glob matching dependencies', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'web4tg-archive-test-'));
  try {
    await writeFile(path.join(directory, 'example.txt'), 'offline security compatibility test');
    const archive = new ZipArchive();
    const entries: string[] = [];
    archive.on('entry', entry => entries.push(entry.name));
    const chunks: Buffer[] = [];
    const completed = new Promise<void>((resolve, reject) => {
      archive.on('data', chunk => chunks.push(chunk));
      archive.on('end', resolve);
      archive.on('error', reject);
    });
    archive.directory(directory, false);
    await archive.finalize();
    await completed;
    assert.deepEqual(entries, ['example.txt']);
    assert.equal(Buffer.concat(chunks).subarray(0, 2).toString(), 'PK');
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('web4tg-archive-test-'));
    await rm(directory, { recursive: true, force: true });
  }
});
