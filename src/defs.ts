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
    LoremIpsum,
    Custom
  }

  export class SampleTextOptions {
    sampleType: SampleType
    constructor(sampleType: SampleType) {
      this.sampleType = sampleType;
    }
  }

  export class PangramOptions extends SampleTextOptions {
    // none yet
    constructor(sampleType: SampleType) { super(sampleType) }
  }

  export class LoremIpsumOptions extends SampleTextOptions {
    // none yet
    constructor(sampleType: SampleType) { super(sampleType) }
  }

  export class CustomTextOptions extends SampleTextOptions {
    customText?: string
    constructor(sampleType: SampleType, customText: string) {
      super(sampleType);
      this.customText = customText;
    }
  }

  export class FontConstructor implements Font {
    file: string;
    fullName: string;
    subfamilyName: string;
    constructor(file: string, fullName: string, subfamilyName: string) {
      this.file = file;
      this.fullName = fullName;
      this.subfamilyName = subfamilyName;
    }
  }
}
