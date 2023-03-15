export namespace FontBrowser {
  export class FontBrowserError extends Error {
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  export class FontFamiliesAccessError extends FontBrowserError { }
  export class ReactRelatedError extends FontBrowserError { }
  export class SampleTextError extends FontBrowserError { }
  export class ElementConstructionError extends ReactRelatedError { }
  export class ReactRenderingError extends ReactRelatedError { }
  export class LoremIpsumError extends SampleTextError { }
  export class PangramAccessError extends SampleTextError { }

  export enum SampleType {
    Pangram,
    LoremIpsum
  }
}
