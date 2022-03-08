import { promisify } from 'util';
import ref, { refType } from 'ref-napi';
import refArray from 'ref-array-di';
import refStruct from 'ref-struct-di';

import { declareFuncs, LibraryInstance } from '../native';

const ArrayType = refArray(ref);
const UcharArrayType = ArrayType('uchar');
const ShortArrayType = ArrayType('short');

const StructType = refStruct(ref);
const IicConfigType = StructType({
  clockSpeedHz: 'uint',
  ownAddr: 'ushort',
  master: 'uchar',
  addrBits: 'uchar',
  enablePu: 'uchar',
});

export const IIC = declareFuncs({
  'IIC_Init': ['int', ['int', 'int', refType(IicConfigType)]],
  'IIC_GetSlaveAddr': ['int', ['int', 'int', ShortArrayType]],
  'IIC_WriteBytes': ['int', ['int', 'int', 'short', UcharArrayType, 'int', 'int']],
  'IIC_ReadBytes': ['int', ['int', 'int', 'short', UcharArrayType, 'int', 'int']],
  'IIC_WriteReadBytes': ['int', ['int', 'int', 'short', UcharArrayType, 'int', UcharArrayType, 'int', 'int']],

  'IIC_BlockWriteBytes': ['int', ['int', 'int', 'short', UcharArrayType, 'int', 'int', 'int']],
  'IIC_BlockReadBytes': ['int', ['int', 'int', 'short', UcharArrayType, 'int', 'int', 'int']],

  'IIC_SlaveWriteBytes': ['int', ['int', 'int', UcharArrayType, 'int', 'int']],
  'IIC_SlaveReadBytes': ['int', ['int', 'int', UcharArrayType, 'int']],
  'IIC_SlaveWriteRemain': ['int', ['int', 'int']],
});

export function getIic(lib: LibraryInstance<typeof IIC>, handle: number) {
  return {
    async init(index: number, config: IicConfig): Promise<void> {
      const iicConfig = new IicConfigType({
        clockSpeedHz: config.clockSpeedHz,
        ownAddr: config.ownAddr || 0,
        master: config.master ? 1 : 0,
        addrBits: config.addrBits,
        enablePu: config.enablePu ? 1 : 0,
      });
      assertErr(await promisify(lib.IIC_Init.async)(handle, index, iicConfig.ref()));
    },
    async getSlaveAddr(index: number): Promise<number> {
      const slaveAddr = new ShortArrayType(1);
      assertErr(await promisify(lib.IIC_GetSlaveAddr.async)(handle, index, slaveAddr));
      return slaveAddr.buffer.readUint16LE(0);
    },
    async writeBytes(index: number, slaveAddr: number, writeData: Buffer, timeout: number): Promise<void> {
      const write = new UcharArrayType(writeData.length);
      writeData.copy(write.buffer);
      assertErr(await promisify(lib.IIC_WriteBytes.async)(handle, index, slaveAddr, write, write.length, timeout));
    },
    async readBytes(index: number, slaveAddr: number, readLen: number, timeout: number): Promise<Buffer> {
      const read = new UcharArrayType(readLen);
      assertErr(await promisify(lib.IIC_ReadBytes.async)(handle, index, slaveAddr, read, read.length, timeout));
      return read.buffer;
    },
    async writeReadBytes(index: number, slaveAddr: number, writeData: Buffer, readLen: number, timeout: number) {
      const write = new UcharArrayType(writeData.length);
      writeData.copy(write.buffer);
      const read = new UcharArrayType(readLen);
      assertErr(await promisify(lib.IIC_WriteReadBytes.async)(handle, index, slaveAddr, write, write.length, read, read.length, timeout));
      return read.buffer;
    },
  };
}

export interface IicConfig {
  clockSpeedHz: number;
  ownAddr?: number;
  master: boolean;
  addrBits: 7 | 10;
  enablePu?: boolean;
}

function assertErr(ret: number) {
  if (ret != 0) throw new Error(`USB2IIC failed with error: ${ret}`);
}
