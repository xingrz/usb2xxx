import { promisify } from 'util';
import ref from 'ref-napi';
import refArray from 'ref-array-di';

import { declareFuncs, LibraryInstance } from '../native';

const ArrayType = refArray(ref);
const IntArray = ArrayType('int');

export const GPIO = declareFuncs({
  'GPIO_SetInput': ['int', ['int', 'uint', 'uchar']],
  'GPIO_SetOutput': ['int', ['int', 'uint', 'uchar']],
  'GPIO_SetOpenDrain': ['int', ['int', 'uint', 'uchar']],
  'GPIO_Write': ['int', ['int', 'uint', 'uint']],
  'GPIO_Read': ['int', ['int', 'uint', IntArray]],
  'GPIO_SendPulses': ['int', ['int', 'uint', 'uint', 'uint', 'uint']],
});

export function getGPIO(lib: LibraryInstance<typeof GPIO>, handle: number) {
  return {
    async setInput(pinMask: number, puPd: GPIOPuPd): Promise<void> {
      assertErr(await promisify(lib.GPIO_SetInput.async)(handle, pinMask, puPd));
    },
    async setOutput(pinMask: number, puPd: GPIOPuPd): Promise<void> {
      assertErr(await promisify(lib.GPIO_SetOutput.async)(handle, pinMask, puPd));
    },
    async setOpenDrain(pinMask: number, puPd: GPIOPuPd): Promise<void> {
      assertErr(await promisify(lib.GPIO_SetOpenDrain.async)(handle, pinMask, puPd));
    },
    async write(pinMask: number, pinValue: number): Promise<void> {
      assertErr(await promisify(lib.GPIO_Write.async)(handle, pinMask, pinValue));
    },
    async read(pinMask: number): Promise<number> {
      const pinValue = new IntArray(1);
      assertErr(await promisify(lib.GPIO_Read.async)(handle, pinMask, pinValue));
      return pinValue.buffer.readUintLE(0, 4);
    },
    async sendPulses(pinMask: number, pulseWidthUs: number, pulsePeriodUs: number, pulseNum: number): Promise<void> {
      assertErr(await promisify(lib.GPIO_SendPulses.async)(handle, pinMask, pulseWidthUs, pulsePeriodUs, pulseNum));
    },
  };
}

export enum GPIOPuPd {
  GPIO_PUPD_NOPULL = 0x00,
  GPIO_PUPD_UP = 0x01,
  GPIO_PUPD_DOWN = 0x02,
};

function assertErr(ret: number) {
  if (ret != 0) throw new Error(`USB2GPIO failed with error: ${ret}`);
}
