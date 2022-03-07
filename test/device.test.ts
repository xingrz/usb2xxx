import UsbDevice from '../src';

describe('UsbDevice', () => {
  test('scanDevice()', async () => {
    const devices = await UsbDevice.scanDevice();
    expect(devices).toBeInstanceOf(Array);
  });
});
