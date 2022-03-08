import UsbDevice from '../../src';

(async () => {
  const devices = await UsbDevice.scanDevice();
  if (devices.length == 0) {
    console.log('No devices');
    return;
  }

  console.log('devices:', devices);

  const dev = await UsbDevice.openDevice(devices[0]);
  if (!dev) {
    console.log('Device not opened');
    return;
  }

  const deviceInfo = await dev.device.getInfo();

  console.log('deviceInfo:', deviceInfo);
})();
