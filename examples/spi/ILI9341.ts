import { setTimeout } from 'timers/promises';

import UsbDevice from '../../src';
import { GPIOPuPd } from '../../src/modules/gpio';
import { SPIIndex, SPILsbFirst, SPIMaster, SPIMode, SPISelPolarity } from '../../src/modules/spi';

const PIN_DC = 1 << 0;
const PIN_RST = 1 << 1;

const MEMORY_ACCESS_MY = (1 << 7);
const MEMORY_ACCESS_MX = (1 << 6);
const MEMORY_ACCESS_MV = (1 << 5);
const MEMORY_ACCESS_ML = (1 << 4);
const MEMORY_ACCESS_BGR = (1 << 3);
const MEMORY_ACCESS_MH = (1 << 2);

const ili9341_reg_conf: [number, number[]][] = [
  [0xCF, [0x00, 0xC1, 0x30]],
  [0xED, [0x64, 0x03, 0x12, 0x81]],
  [0xE8, [0x85, 0x00, 0x79]],
  [0xCB, [0x39, 0x2C, 0x00, 0x34, 0x02]],
  [0xF7, [0x20]],
  [0xEA, [0x00, 0x00]],

  // Power control
  [0xC0, [0x1D]],  // VRH[5:0]
  [0xC1, [0x12]],  // SAP[2:0];BT[3:0]

  // VCM control
  [0xC5, [0x33, 0x3F]],
  [0xC7, [0x92]],

  // Memory Access Control
  [0x3A, [0x55]],
  [0x36, [MEMORY_ACCESS_BGR]],

  [0xB1, [0x00, 0x12]],

  // Display Function Control
  [0xB6, [0x0A, 0xA2]],

  [0x44, [0x02]],

  // 3Gamma Function Disable
  [0xF2, [0x00]],

  // Gamma curve selected
  [0x26, [0x01]],

  // Set Gamma
  [0xE0, [0x0F, 0x22, 0x1C, 0x1B, 0x08, 0x0F, 0x48, 0xB8, 0x34, 0x05, 0x0C, 0x09, 0x0F, 0x07, 0x00]],
  [0XE1, [0x00, 0x23, 0x24, 0x07, 0x10, 0x07, 0x38, 0x47, 0x4B, 0x0A, 0x13, 0x06, 0x30, 0x38, 0x0F]],

  // Display on
  [0x29, []],
];

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

  await dev.spi.init(SPIIndex.SPI1, {
    mode: SPIMode.SPI_MODE_HARD_FDX,
    master: SPIMaster.SPI_MASTER,
    cpol: 0,
    cpha: 0,
    lsbFirst: SPILsbFirst.SPI_MSB,
    selPolarity: SPISelPolarity.SPI_SEL_LOW,
    clockSpeedHz: 50_000_000,
  });

  await dev.gpio.setOutput(PIN_DC, GPIOPuPd.GPIO_PUPD_UP);
  await dev.gpio.setOutput(PIN_RST, GPIOPuPd.GPIO_PUPD_UP);

  // reset panel
  await dev.gpio.write(PIN_RST, PIN_RST);
  await setTimeout(100);
  await dev.gpio.write(PIN_RST, 0);
  await setTimeout(100);
  await dev.gpio.write(PIN_RST, PIN_RST);
  await setTimeout(100);

  // init panel
  await ili9341_write(dev, 0x11);  // sleep out
  await setTimeout(120);
  for (const [cmd, data] of ili9341_reg_conf) {
    await ili9341_write(dev, cmd, Buffer.from(data));
  }

  // fill black
  await ili9341_fill(dev, 0x000000, 0, 0, 240, 320);

  // draw rect
  await setTimeout(300);
  await ili9341_fill(dev, 0xFFFFFF, 20, 100, 220, 80);
  await setTimeout(300);
  await ili9341_fill(dev, 0x0000FF, 120, 200, 120, 40);
  await setTimeout(300);
  await ili9341_fill(dev, 0x00FF00, 100, 10, 50, 300);
  await setTimeout(300);
  await ili9341_fill(dev, 0xFF0000, 50, 220, 120, 50);
})();

async function ili9341_write(dev: UsbDevice, cmd: number, data?: Buffer): Promise<void> {
  await dev.gpio.write(PIN_DC, 0);
  await dev.spi.writeBytesAsync(SPIIndex.SPI1_CS0, Buffer.from([cmd]));
  await dev.gpio.write(PIN_DC, 1);
  if (data && data.length) {
    const SLICE_LEN = 10 * 1024;
    for (let i = 0; i < data.length; i += SLICE_LEN) {
      await dev.spi.writeBytesAsync(SPIIndex.SPI1_CS0, data.slice(i, i + SLICE_LEN));
    }
  }
}

async function ili9341_set_window(dev: UsbDevice, x1: number, y1: number, x2: number, y2: number): Promise<void> {
  const buf = Buffer.alloc(4);
  buf.writeUint16BE(x1, 0);
  buf.writeUint16BE(x2, 2);
  await ili9341_write(dev, 0x2A, buf);
  buf.writeUint16BE(y1, 0);
  buf.writeUint16BE(y2, 2);
  await ili9341_write(dev, 0x2B, buf);
}

async function ili9341_draw(dev: UsbDevice, bitmap: Buffer, x: number, y: number, w: number, h: number): Promise<void> {
  await ili9341_set_window(dev, x, y, x + w - 1, y + h - 1);
  await ili9341_write(dev, 0x2C, bitmap);
}

async function ili9341_fill(dev: UsbDevice, color: number, x: number, y: number, w: number, h: number): Promise<void> {
  const buf = Buffer.alloc(w * h * 2);
  for (let i = 0; i < w * h; i++) {
    buf.writeUint16BE(RGB565(color), i * 2);
  }
  await ili9341_draw(dev, buf, x, y, w, h);
}

function RGB565(rgb: number): number {
  let [r, g, b] = [(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF];
  r >>= 3;
  g >>= 2;
  b >>= 3;
  return (r << 11) | (g << 5) | b;
}
