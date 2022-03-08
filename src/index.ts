import { Library } from 'ffi-napi';

import { LIB_PATH } from './native';

import { DEVICE, getDevice, getDeviceStatic } from './modules/device';
import { getGPIO, GPIO } from './modules/gpio';
import { getIIC, IIC } from './modules/iic';
import { getSPI, SPI } from './modules/spi';

const lib = new Library(LIB_PATH, {
  ...DEVICE,
  ...GPIO,
  ...IIC,
  ...SPI,
});

export default class UsbDevice {
  private static DEVICE = getDeviceStatic(lib);

  readonly device: ReturnType<typeof getDevice>;
  readonly gpio: ReturnType<typeof getGPIO>;
  readonly iic: ReturnType<typeof getIIC>;
  readonly spi: ReturnType<typeof getSPI>;

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
    this.gpio = getGPIO(lib, handle);
    this.iic = getIIC(lib, handle);
    this.spi = getSPI(lib, handle);
  }
}
