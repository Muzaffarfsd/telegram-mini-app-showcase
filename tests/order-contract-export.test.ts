import assert from 'node:assert/strict';
import test from 'node:test';
import { unzipSync, strFromU8 } from 'fflate';
import { prepareOrderContract, deliverPreparedOrderContract, downloadPreparedOrderContract } from '../client/src/components/orderContractExport';

const sample = { title: 'ПРОЕКТ ДОГОВОРА', sections: [
  { heading: '1. Предмет', paragraphs: ['Магазин «Тест» & <клиент>\u0001', 'Цена 150 000 ₽; предоплата 50%.'] },
  { heading: '2. Поддержка', paragraphs: ['Оплата поддержки: 100% до начала периода.'] },
] };

test('prepares an actual local Word document with all selected text and valid XML', async () => {
  const prepared = await prepareOrderContract(sample);
  assert.equal(prepared.blob.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.match(prepared.fileName, /\.docx$/);
  const zip = unzipSync(new Uint8Array(await prepared.blob.arrayBuffer()));
  assert.ok(zip['[Content_Types].xml']);
  assert.ok(zip['word/document.xml']);
  const xml = strFromU8(zip['word/document.xml']);
  for (const expected of ['ПРОЕКТ ДОГОВОРА', 'Предмет', '150 000 ₽', '100% до начала периода']) assert.ok(xml.includes(expected));
  assert.ok(xml.includes('&amp;') && xml.includes('&lt;клиент&gt;'));
  assert.ok(!xml.includes('\u0001'));
});

test('rejects empty contract rather than producing a misleading file', async () => {
  await assert.rejects(prepareOrderContract({title:'',sections:[]}));
});

test('shares synchronously and reports cancellation or failure without claiming a save', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const file = new File(['docx'], 'draft.docx');
  const prepared = {blob:file, file, fileName:file.name};
  let called = 0;
  try {
    Object.defineProperty(globalThis, 'navigator', {configurable:true, value: {
      canShare: (data: ShareData) => data.files?.[0] === file,
      share: () => { called++; return Promise.resolve(); },
    }});
    const result = deliverPreparedOrderContract(prepared);
    assert.equal(called,1, 'share must run before the initiating handler returns');
    assert.equal(await result,'shared');
    Object.defineProperty(globalThis, 'navigator', {configurable:true, value: {canShare:()=>true, share:()=>Promise.reject(Object.assign(new Error('cancelled'),{name:'AbortError'}))}});
    assert.equal(await deliverPreparedOrderContract(prepared),'cancelled');
    Object.defineProperty(globalThis, 'navigator', {configurable:true, value: {canShare:()=>true, share:()=>Promise.reject(new Error('denied'))}});
    assert.equal(await deliverPreparedOrderContract(prepared),'unavailable');
  } finally {
    if (previous) Object.defineProperty(globalThis,'navigator',previous); else Reflect.deleteProperty(globalThis,'navigator');
  }
});

test('downloads only by request, with delayed cleanup, and signals missing API', () => {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL, oldTimer = globalThis.setTimeout;
  const file = new File(['docx'], 'draft.docx');
  const prepared = {blob:file, file, fileName:file.name};
  let clicked = 0, removed = 0, revoked = 0, cleanup: (() => void) | undefined;
  try {
    Object.defineProperty(globalThis,'document',{configurable:true,value:{
      body:{appendChild:()=>{}},
      createElement:()=>({style:{},click:()=>{clicked++},remove:()=>{removed++}}),
    }});
    URL.createObjectURL = () => 'blob:unit-test';
    URL.revokeObjectURL = () => {revoked++};
    globalThis.setTimeout = ((fn: () => void) => {cleanup=fn; return 1 as unknown as ReturnType<typeof setTimeout>}) as typeof setTimeout;
    assert.equal(downloadPreparedOrderContract(prepared),'download-requested');
    assert.equal(clicked,1); assert.equal(removed,1); assert.equal(revoked,0);
    cleanup?.(); assert.equal(revoked,1);
    URL.createObjectURL = () => { throw new Error('blocked') };
    assert.equal(downloadPreparedOrderContract(prepared),'unavailable');
  } finally {
    URL.createObjectURL=oldCreate; URL.revokeObjectURL=oldRevoke; globalThis.setTimeout=oldTimer;
    if (oldDocument) Object.defineProperty(globalThis,'document',oldDocument); else Reflect.deleteProperty(globalThis,'document');
  }
});
