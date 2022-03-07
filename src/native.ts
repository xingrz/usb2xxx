import { resolve } from 'path';
import {
  LibraryObject,
  LibraryObjectDefinitionBase,
  LibraryObjectDefinitionInferenceMarker,
  LibraryObjectDefinitionToLibraryDefinition,
} from 'ffi-napi';

export const LIB_FILE = (() => {
  switch (process.platform) {
    case 'darwin': return 'libUSB2XXX.dylib';
    case 'linux': return 'libUSB2XXX.so';
    case 'win32': return 'USB2XXX.dll';
  }
})();

if (!LIB_FILE) {
  throw new Error(`USB2XXX is not support for ${process.platform}/${process.arch}`);
}

export const LIB_PATH = resolve(__dirname, '..', 'usb2xxx', process.platform, process.arch, LIB_FILE);

type LibraryObjectDefinition = LibraryObjectDefinitionBase | LibraryObjectDefinitionInferenceMarker;

export function declareFuncs<T extends LibraryObjectDefinition>(funcs: T): T {
  return funcs;
}

export type LibraryInstance<T extends LibraryObjectDefinition> = LibraryObject<LibraryObjectDefinitionToLibraryDefinition<T>>;
