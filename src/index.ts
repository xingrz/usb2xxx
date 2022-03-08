import { Library } from 'ffi-napi';

import { LIB_PATH } from './native';

import { DEVICE, getDevice, getDeviceStatic } from './modules/device';
import { getGpio, GPIO } from './modules/gpio';
import { getIic, IIC } from './modules/iic';

const lib = new Library(LIB_PATH, {
  ...DEVICE,
  ...GPIO,
  ...IIC,
});

export default class UsbDevice {
  private static DEVICE = getDeviceStatic(lib);

  readonly device: ReturnType<typeof getDevice>;
  readonly gpio: ReturnType<typeof getGpio>;
  readonly iic: ReturnType<typeof getIic>;

  static async scanDevice(): Promise<number[]> {
    return await UsbDevice.DEVICE.scan();
  }

  static async openDevice(handle: number): Promise<UsbDevice | undefined> {
    if (await UsbDevice.DEVICE.open(handle)) {
      return new UsbDevice(handle);
    }
  }

  constructor(handle: number) {
    this.device = getDevice(lib, handle);
    this.gpio = getGpio(lib, handle);
    this.iic = getIic(lib, handle);
  }
}
