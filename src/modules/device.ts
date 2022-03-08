import { promisify } from 'util';
import ref, { readCString, refType } from 'ref-napi';
import refArray from 'ref-array-di';
import refStruct from 'ref-struct-di';

import { declareFuncs, LibraryInstance } from '../native';

const ArrayType = refArray(ref);
const CharArray = ArrayType('char');
const IntArray = ArrayType('int');

const StructType = refStruct(ref);
const DeviceInfoStruct = StructType({
  firmwareName: ArrayType('char', 32),
  buildDate: ArrayType('char', 32),
  hardwareVersion: 'int',
  firmwareVersion: 'int',
  serialNumber: ArrayType('uint', 3),
  functions: 'int',
});

export const DEVICE = declareFuncs({
  'USB_ScanDevice': ['int', [IntArray]],
  'USB_OpenDevice': ['bool', ['int']],
  'USB_CloseDevice': ['bool', ['int']],
  'USB_ResetDevice': ['bool', ['int']],
  'DEV_GetDeviceInfo': ['bool', ['int', refType(DeviceInfoStruct), CharArray]],
  'DEV_SetPowerLevel': ['bool', ['int', 'char']],
});

export function getDeviceStatic(lib: LibraryInstance<typeof DEVICE>) {
  return {
    async scan(): Promise<number[]> {
      const devices = new IntArray(10);
      const count = await promisify(lib.USB_ScanDevice.async)(devices);
      return devices.toArray().slice(0, count);
    },
    async open(handle: number): Promise<boolean> {
      return await promisify(lib.USB_OpenDevice.async)(handle);
    },
  };
}

export function getDevice(lib: LibraryInstance<typeof DEVICE>, handle: number) {
  return {
    async getInfo(): Promise<DeviceInfo | undefined> {
      const deviceInfo = new DeviceInfoStruct();
      const functions = new CharArray(256);
      if (await promisify(lib.DEV_GetDeviceInfo.async)(handle, deviceInfo.ref(), functions)) {
        const { hardwareVersion: hv, firmwareVersion: fv, serialNumber: sn } = deviceInfo;
        return {
          firmwareName: readCString(deviceInfo.firmwareName.buffer),
          buildDate: readCString(deviceInfo.buildDate.buffer),
          hardwareVersion: `${(hv >> 24) & 0xff}.${(hv >> 16) & 0xff}.${hv & 0xffff}`,
          firmwareVersion: `${(fv >> 24) & 0xff}.${(fv >> 16) & 0xff}.${fv & 0xffff}`,
          serialNumber: sn.buffer.swap32().toString('hex').toUpperCase(),
          functions: readCString(functions.buffer).trim().split(','),
        };
      }
    },
    async close(): Promise<void> {
      assertErr(await promisify(lib.USB_CloseDevice.async)(handle));
    },
    async reset(): Promise<void> {
      assertErr(await promisify(lib.USB_ResetDevice.async)(handle));
    },
    async setPowerLevel(powerLevel: number): Promise<void> {
      assertErr(await promisify(lib.DEV_SetPowerLevel.async)(handle, powerLevel))
    },
  };
}

export interface DeviceInfo {
  firmwareName: string;
  buildDate: string;
  hardwareVersion: string;
  firmwareVersion: string;
  serialNumber: string;
  functions: string[];
}

function assertErr(ret: boolean) {
  if (!ret) throw new Error(`USBDevice failed`);
}
