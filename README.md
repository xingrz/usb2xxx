usb2xxx [![test](https://github.com/xingrz/usb2xxx/actions/workflows/test.yml/badge.svg)](https://github.com/xingrz/usb2xxx/actions/workflows/test.yml)
==========

[![][npm-version]][npm-url] [![][npm-downloads]][npm-url] [![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

Node.js bindings for [USB2XXX](http://www.toomoss.com/product/1-cn.html) Bus Adapter.

## Installation

```sh
npm install --save usb2xxx
```

## Support platforms

| arch / platform | `darwin` | `linux` | `win32` |
| --------------- | -------- | ------- | ------- |
| `x64`           | ✓        | ✓       | TODO    |
| `arm64`         | ×        | ✓       | ×       |

## Features / TODOs

- [x] GPIO
- [ ] ADC
- [ ] DAC
- [ ] Sniffer
- [ ] SPI
- [ ] LIN
- [ ] PWM
- [x] I²C
- [ ] UART
- [ ] CAN
- [ ] CANFD

## Run examples

```ts
npx ts-node examples/device/getDeviceInfo.ts
```

## Test

```sh
npm test
```

## License

[MIT License](LICENSE)

[npm-version]: https://img.shields.io/npm/v/usb2xxx.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/usb2xxx.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/usb2xxx
[license-img]: https://img.shields.io/github/license/xingrz/usb2xxx?style=flat-square
[license-url]: LICENSE
[issues-img]: https://img.shields.io/github/issues/xingrz/usb2xxx?style=flat-square
[issues-url]: https://github.com/xingrz/usb2xxx/issues
[stars-img]: https://img.shields.io/github/stars/xingrz/usb2xxx?style=flat-square
[stars-url]: https://github.com/xingrz/usb2xxx/stargazers
[commits-img]: https://img.shields.io/github/last-commit/xingrz/usb2xxx?style=flat-square
[commits-url]: https://github.com/xingrz/usb2xxx/commits/master
