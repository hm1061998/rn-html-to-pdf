import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'rn-html-to-pdf' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RnHtmlToPdf = NativeModules.RnHtmlToPdf
  ? NativeModules.RnHtmlToPdf
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return RnHtmlToPdf.multiply(a, b);
}
export function convert(options: {
  html: string;
  fileName: string;
  base64: boolean;
  width: number;
  height: number;
  directory: string;
  padding: number;
  paddingRight: number;
  paddingTop: number;
  paddingLeft: number;
  paddingBottom: number;
}): Promise<number> {
  return RnHtmlToPdf.convert(options);
}
