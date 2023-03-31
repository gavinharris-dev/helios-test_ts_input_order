import fetch from 'cross-fetch';
import { expect, describe, test } from 'vitest';

import {
  NetworkEmulator,
  TxOutput,
  Value,
  NetworkParams,
  TxId,
  UTxO,
  ByteArrayData,
  Address,
} from '@hyperionbt/helios';

function fakeInput(address: Address, hex: string, index: BigInt) {
  return new UTxO(
    TxId.fromHex(hex),
    index.valueOf(),
    new TxOutput(address, new Value(1n))
  );
}

function testSort(a: UTxO, b: UTxO) {
  const utxo1 = `${a.txId.hex}#${a.utxoIdx}`.toUpperCase();
  const utxo2 = `${b.txId.hex}#${b.utxoIdx}`.toUpperCase();

  if (utxo1 > utxo2) return 1;
  if (utxo1 < utxo2) return -1;

  return 0;
}

test('TEST001: Test the same scenario as from Cardano Serialization Lib', () => {
  const networkEmulator = new NetworkEmulator();
  const alice = networkEmulator.createWallet();

  const txInputs: UTxO[] = [
    fakeInput(
      alice.address,
      '0202020202020202020202020202020202020202020202020202020202020202',
      0n
    ),
    fakeInput(
      alice.address,
      '0202020202020202020202020202020202020202020202020202020202020202',
      1n
    ),
    fakeInput(
      alice.address,
      '0101010101010101010101010101010101010101010101010101010101010101',
      0n
    ),
  ];

  console.log(
    'Before',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );
  txInputs.sort(UTxO.comp);
  console.log(
    'After',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );

  expect(txInputs[0].txId.hex).toEqual(
    '0101010101010101010101010101010101010101010101010101010101010101'
  );

  expect(txInputs[1].txId.hex).toEqual(
    '0202020202020202020202020202020202020202020202020202020202020202'
  );

  expect(txInputs[2].txId.hex).toEqual(
    '0202020202020202020202020202020202020202020202020202020202020202'
  );

  expect(txInputs[0].utxoIdx).toEqual(0n);

  expect(txInputs[1].utxoIdx).toEqual(0n);
  expect(txInputs[2].utxoIdx).toEqual(1n);
});

test('TEST002: Test the same scenario as from Cardano Serialization Lib - Using different sort', () => {
  const networkEmulator = new NetworkEmulator();
  const alice = networkEmulator.createWallet();

  const txInputs: UTxO[] = [
    fakeInput(
      alice.address,
      '0202020202020202020202020202020202020202020202020202020202020202',
      0n
    ),
    fakeInput(
      alice.address,
      '0202020202020202020202020202020202020202020202020202020202020202',
      1n
    ),
    fakeInput(
      alice.address,
      '0101010101010101010101010101010101010101010101010101010101010101',
      0n
    ),
  ];

  console.log(
    'Before',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );
  txInputs.sort(testSort);
  console.log(
    'After',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );

  expect(txInputs[0].txId.hex).toEqual(
    '0101010101010101010101010101010101010101010101010101010101010101'
  );

  expect(txInputs[1].txId.hex).toEqual(
    '0202020202020202020202020202020202020202020202020202020202020202'
  );

  expect(txInputs[2].txId.hex).toEqual(
    '0202020202020202020202020202020202020202020202020202020202020202'
  );

  expect(txInputs[0].utxoIdx).toEqual(0n);

  expect(txInputs[1].utxoIdx).toEqual(0n);
  expect(txInputs[2].utxoIdx).toEqual(1n);
});

test('TEST003: Should sort the TxInputs by TxId#TxIndex', async () => {
  const networkEmulator = new NetworkEmulator();
  const alice = networkEmulator.createWallet();

  const txInputs = [
    fakeInput(
      alice.address,
      '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7',
      0n
    ),
    fakeInput(
      alice.address,
      'a000000000000000000000000000000000000000000000000000000000000000',
      0n
    ),
    fakeInput(
      alice.address,
      '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7',
      1n
    ),
    fakeInput(
      alice.address,
      '0000000000000000000000000000000000000000000000000000000000000000',
      0n
    ),
  ];

  console.log(
    'Before',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );

  txInputs.sort(UTxO.comp);

  console.log(
    'After',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );

  /* Output from Serialization Lib
'0000000000000000000000000000000000000000000000000000000000000000', 
0n
'1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7', 
0n
'1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7', 
1n
'a000000000000000000000000000000000000000000000000000000000000000', 
0n
*/

  expect(txInputs[0].txId.hex).toEqual(
    '0000000000000000000000000000000000000000000000000000000000000000'
  );
  expect(txInputs[0].utxoIdx).toEqual(0n);

  expect(txInputs[1].txId.hex).toEqual(
    '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7'
  );
  expect(txInputs[1].utxoIdx).toEqual(0n);

  expect(txInputs[2].txId.hex).toEqual(
    '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7'
  );
  expect(txInputs[2].utxoIdx).toEqual(1n);

  expect(txInputs[3].txId.hex).toEqual(
    'A000000000000000000000000000000000000000000000000000000000000000'
  );
  expect(txInputs[3].utxoIdx).toEqual(0n);
});

test('TEST004: Should sort the TxInputs by TxId#TxIndex', async () => {
  const networkEmulator = new NetworkEmulator();
  const alice = networkEmulator.createWallet();

  const txInputs = [
    fakeInput(
      alice.address,
      '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7',
      0n
    ),
    fakeInput(
      alice.address,
      'a000000000000000000000000000000000000000000000000000000000000000',
      0n
    ),
    fakeInput(
      alice.address,
      '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7',
      1n
    ),
    fakeInput(
      alice.address,
      '0000000000000000000000000000000000000000000000000000000000000000',
      0n
    ),
  ];

  console.log(
    'Before',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );

  txInputs.sort(testSort);

  console.log(
    'After',
    txInputs.map((x) => `${x.txId.hex}#${x.utxoIdx}`)
  );

  /* Output from Serialization Lib
'0000000000000000000000000000000000000000000000000000000000000000', 
0n
'1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7', 
0n
'1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7', 
1n
'a000000000000000000000000000000000000000000000000000000000000000', 
0n
*/

  expect(txInputs[0].txId.hex).toEqual(
    '0000000000000000000000000000000000000000000000000000000000000000'
  );
  expect(txInputs[0].utxoIdx).toEqual(0n);

  expect(txInputs[1].txId.hex).toEqual(
    '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7'
  );
  expect(txInputs[1].utxoIdx).toEqual(0n);

  expect(txInputs[2].txId.hex).toEqual(
    '1b56fc4a62e897481a5606bfa88502b48ae4a02b9abcbdfdd8e568144b21c2b7'
  );
  expect(txInputs[2].utxoIdx).toEqual(1n);

  expect(txInputs[3].txId.hex).toEqual(
    'a000000000000000000000000000000000000000000000000000000000000000'
  );
  expect(txInputs[3].utxoIdx).toEqual(0n);
});
