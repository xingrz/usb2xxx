import UsbDevice from '../../src';

(async () => {
  const devices = await UsbDevice.scanDevice();
  if (devices.length == 0) {
    console.log('No devices');
    return;
  }

  const dev = await UsbDevice.openDevice(devices[0]);
  if (!dev) {
    console.log('Device not opened');
    return;
  }

  await dev.iic.init(0, {
    clockSpeedHz: 200000,
    master: true,
    addrBits: 7,
  });

  await dev.iic.writeBytes(0, 0x44, Buffer.from([0x2c, 0x06]), 200);
  const r1 = await dev.iic.readBytes(0, 0x44, 6, 200);
  console.log('result 1:', r1.toString('hex'));

  const r2 = await dev.iic.writeReadBytes(0, 0x44, Buffer.from([0x2c, 0x06]), 6, 200);
  console.log('result 2:', r2.toString('hex'));
})();
