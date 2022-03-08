import UsbDevice from '../../src';
import { IICIndex, IICMaster } from '../../src/modules/iic';

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

  await dev.iic.init(IICIndex.I2C0, {
    clockSpeedHz: 200_000,
    ownAddr: 0,
    master: IICMaster.IIC_MASTER,
    addrBits: 7,
    enablePu: 0,
  });

  await dev.iic.writeBytes(IICIndex.I2C0, 0x44, Buffer.from([0x2c, 0x06]), 200);
  const r1 = await dev.iic.readBytes(IICIndex.I2C0, 0x44, 6, 200);
  console.log('result 1:', r1.toString('hex'));

  const r2 = await dev.iic.writeReadBytes(IICIndex.I2C0, 0x44, Buffer.from([0x2c, 0x06]), 6, 200);
  console.log('result 2:', r2.toString('hex'));
})();
