import { promisify } from 'util';
import ref, { refType } from 'ref-napi';
import refArray from 'ref-array-di';
import refStruct from 'ref-struct-di';

import { declareFuncs, LibraryInstance } from '../native';

const ArrayType = refArray(ref);
const UcharArray = ArrayType('uchar');

const StructType = refStruct(ref);
const SPIConfigStruct = StructType({
  mode: 'char',
  master: 'char',
  cpol: 'char',
  cpha: 'char',
  lsbFirst: 'char',
  selPolarity: 'char',
  clockSpeedHz: 'uint',
});

export const SPI = declareFuncs({
  'SPI_Init': ['int', ['int', 'int', refType(SPIConfigStruct)]],
  'SPI_WriteBytes': ['int', ['int', 'int', UcharArray, 'int']],
  'SPI_WriteBytesAsync': ['int', ['int', 'int', UcharArray, 'int']],
  'SPI_ReadBytes': ['int', ['int', 'int', UcharArray, 'int']],
  'SPI_WriteReadBytes': ['int', ['int', 'int', UcharArray, 'int', UcharArray, 'int', 'int']],
});

export function getSPI(lib: LibraryInstance<typeof SPI>, handle: number) {
  return {
    async init(index: number, config: SPIConfig): Promise<void> {
      const spiConfig = new SPIConfigStruct(config);
      assertErr(await promisify(lib.SPI_Init.async)(handle, index, spiConfig.ref()));
    },
    async writeBytes(index: number, writeData: Buffer): Promise<void> {
      const write = new UcharArray(writeData.length);
      writeData.copy(write.buffer);
      assertErr(await promisify(lib.SPI_WriteBytes.async)(handle, index, write, write.length));
    },
    async writeBytesAsync(index: number, writeData: Buffer): Promise<void> {
      const write = new UcharArray(writeData.length);
      writeData.copy(write.buffer);
      assertErr(await promisify(lib.SPI_WriteBytesAsync.async)(handle, index, write, write.length));
    },
    async readBytes(index: number, readLen: number): Promise<Buffer> {
      const read = new UcharArray(readLen);
      assertErr(await promisify(lib.SPI_ReadBytes.async)(handle, index, read, read.length));
      return read.buffer;
    },
    async writeReadBytes(index: number, writeData: Buffer, readLen: number, intervalTimeUs: number) {
      const write = new UcharArray(writeData.length);
      writeData.copy(write.buffer);
      const read = new UcharArray(readLen);
      assertErr(await promisify(lib.SPI_WriteReadBytes.async)(handle, index, write, write.length, read, read.length, intervalTimeUs));
      return read.buffer;
    },
  };
}

export enum SPIIndex {
  SPI1 = 0x00,
  SPI1_CS0 = 0x00,
  SPI1_CS1 = 0x10,
  SPI1_CS2 = 0x20,
  SPI1_CS3 = 0x30,
  SPI1_CS4 = 0x40,
  SPI2 = 0x01,
  SPI2_CS0 = 0x01,
  SPI2_CS1 = 0x11,
  SPI2_CS2 = 0x21,
  SPI2_CS3 = 0x31,
  SPI2_CS4 = 0x41,
}

export interface SPIConfig {
  mode: SPIMode;
  master: SPIMaster;
  cpol: number;
  cpha: number;
  lsbFirst: SPILsbFirst;
  selPolarity: SPISelPolarity;
  clockSpeedHz: number;
}

export enum SPIMode {
  SPI_MODE_HARD_FDX = 0,
  SPI_MODE_HARD_HDX = 1,
  SPI_MODE_SOFT_HDX = 2,
  SPI_MODE_SOFT_ONE_WIRE = 3,
  SPI_MODE_SOFT_FDX = 4,
}

export enum SPIMaster {
  SPI_SLAVE = 0,
  SPI_MASTER = 1,
}

export enum SPILsbFirst {
  SPI_MSB = 0,
  SPI_LSB = 1,
}

export enum SPISelPolarity {
  SPI_SEL_LOW = 0,
  SPI_SEL_HIGH = 1,
}

function assertErr(ret: number) {
  if (ret != 0) throw new Error(`USB2SPI failed with error: ${ret}`);
}
