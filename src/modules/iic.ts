import { promisify } from 'util';
import ref, { refType } from 'ref-napi';
import refArray from 'ref-array-di';
import refStruct from 'ref-struct-di';

import { declareFuncs, LibraryInstance } from '../native';

const ArrayType = refArray(ref);
const UcharArray = ArrayType('uchar');
const ShortArray = ArrayType('short');

const StructType = refStruct(ref);
const IICConfigStruct = StructType({
  clockSpeedHz: 'uint',
  ownAddr: 'ushort',
  master: 'uchar',
  addrBits: 'uchar',
  enablePu: 'uchar',
});

export const IIC = declareFuncs({
  'IIC_Init': ['int', ['int', 'int', refType(IICConfigStruct)]],
  'IIC_GetSlaveAddr': ['int', ['int', 'int', ShortArray]],
  'IIC_WriteBytes': ['int', ['int', 'int', 'short', UcharArray, 'int', 'int']],
  'IIC_ReadBytes': ['int', ['int', 'int', 'short', UcharArray, 'int', 'int']],
  'IIC_WriteReadBytes': ['int', ['int', 'int', 'short', UcharArray, 'int', UcharArray, 'int', 'int']],

  'IIC_BlockWriteBytes': ['int', ['int', 'int', 'short', UcharArray, 'int', 'int', 'int']],
  'IIC_BlockReadBytes': ['int', ['int', 'int', 'short', UcharArray, 'int', 'int', 'int']],

  'IIC_SlaveWriteBytes': ['int', ['int', 'int', UcharArray, 'int', 'int']],
  'IIC_SlaveReadBytes': ['int', ['int', 'int', UcharArray, 'int']],
  'IIC_SlaveWriteRemain': ['int', ['int', 'int']],
});

export function getIIC(lib: LibraryInstance<typeof IIC>, handle: number) {
  return {
    async init(index: number, config: IICConfig): Promise<void> {
      const iicConfig = new IICConfigStruct(config);
      assertErr(await promisify(lib.IIC_Init.async)(handle, index, iicConfig.ref()));
    },
    async getSlaveAddr(index: number): Promise<number> {
      const slaveAddr = new ShortArray(1);
      assertErr(await promisify(lib.IIC_GetSlaveAddr.async)(handle, index, slaveAddr));
      return slaveAddr.buffer.readUint16LE(0);
    },
    async writeBytes(index: number, slaveAddr: number, writeData: Buffer, timeout: number): Promise<void> {
      const write = new UcharArray(writeData.length);
      writeData.copy(write.buffer);
      assertErr(await promisify(lib.IIC_WriteBytes.async)(handle, index, slaveAddr, write, write.length, timeout));
    },
    async readBytes(index: number, slaveAddr: number, readLen: number, timeout: number): Promise<Buffer> {
      const read = new UcharArray(readLen);
      assertErr(await promisify(lib.IIC_ReadBytes.async)(handle, index, slaveAddr, read, read.length, timeout));
      return read.buffer;
    },
    async writeReadBytes(index: number, slaveAddr: number, writeData: Buffer, readLen: number, timeout: number) {
      const write = new UcharArray(writeData.length);
      writeData.copy(write.buffer);
      const read = new UcharArray(readLen);
      assertErr(await promisify(lib.IIC_WriteReadBytes.async)(handle, index, slaveAddr, write, write.length, read, read.length, timeout));
      return read.buffer;
    },
  };
}

export enum IICIndex {
  I2C0 = 0,
  I2C1 = 1,
  I2C2 = 2,
  I2C3 = 3,
  I2C4 = 4,
  I2C5 = 5,
  I2C6 = 6,
  I2C7 = 7,
}

export interface IICConfig {
  clockSpeedHz: number;
  ownAddr: number;
  master: IICMaster;
  addrBits: 7 | 10;
  enablePu: 0 | 1;
}

export enum IICMaster {
  IIC_SLAVE = 0,
  IIC_MASTER = 1,
}

function assertErr(ret: number) {
  if (ret != 0) throw new Error(`USB2IIC failed with error: ${ret}`);
}
