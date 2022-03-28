import { join, resolve } from 'path';
import {
  DynamicLibrary,
  LibraryObject,
  LibraryObjectDefinitionBase,
  LibraryObjectDefinitionInferenceMarker,
  LibraryObjectDefinitionToLibraryDefinition,
  RTLD_NOW,
} from '@xingrz/ffi-napi';

export const LIB_FILE = (() => {
  switch (process.platform) {
    case 'darwin': return 'libUSB2XXX.dylib';
    case 'linux': return 'libUSB2XXX.so';
    case 'win32': return 'USB2XXX.dll';
  }
})();

const LIBUSB_FILE = (() => {
  switch (process.platform) {
    case 'darwin': return 'libusb-1.0.0.dylib';
    case 'linux': return 'libusb-1.0.so';
    case 'win32': return 'libusb-1.0.dll';
  }
})();

if (!LIB_FILE || !LIBUSB_FILE) {
  throw new Error(`USB2XXX is not support for ${process.platform}/${process.arch}`);
}

const LIB_ROOT = resolve(__dirname, '..', 'usb2xxx', process.platform, process.arch);
new DynamicLibrary(join(LIB_ROOT, LIBUSB_FILE), RTLD_NOW);

export const LIB_PATH = join(LIB_ROOT, LIB_FILE);

type LibraryObjectDefinition = LibraryObjectDefinitionBase | LibraryObjectDefinitionInferenceMarker;

export function declareFuncs<T extends LibraryObjectDefinition>(funcs: T): T {
  return funcs;
}

export type LibraryInstance<T extends LibraryObjectDefinition> = LibraryObject<LibraryObjectDefinitionToLibraryDefinition<T>>;
