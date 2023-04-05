#import "RnHtmlToPdf.h"

#import <PDFKit/PDFKit.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@implementation RnHtmlToPdf
RCT_EXPORT_MODULE()

// Example methodcsxsfsfsfds
// See // https://reactnative.dev/docs/native-modules-ios
RCT_REMAP_METHOD(multiply,
                 multiplyWithA:(double)a withB:(double)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSNumber *result = @(a * b);

    resolve(result);
}

RCT_EXPORT_METHOD(convert:(NSDictionary *)options  
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Convert HTML to NSAttributedString

    NSString *htmlString = [RCTConvert NSString:options[@"html"]];
    NSString *fileName = [RCTConvert NSString:options[@"fileName"]];
    NSData *htmlData = [htmlString dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *options = @{NSDocumentTypeDocumentAttribute: NSHTMLTextDocumentType};
    NSAttributedString *attributedString = [[NSAttributedString alloc] initWithData:htmlData options:options documentAttributes:nil error:nil];
    
    // Create PDF from NSAttributedString
    self.pdfDocument = [[PDFDocument alloc] init];
    PDFPage *pdfPage = [[PDFPage alloc] initWithAttributedText:attributedString];
    [self.pdfDocument insertPage:pdfPage atIndex:self.pdfDocument.pageCount];
    
    // Save PDF to file
    NSURL *tempDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
    NSURL *pdfFileURL = [tempDirURL URLByAppendingPathComponent:@"example.pdf"];
    BOOL success = [self.pdfDocument writeToFile:[pdfFileURL path]];
    
    if (success) {
        resolve(@[[NSNull null], [pdfFileURL path]]);
    } else {
        NSString *errorMessage = @"Failed to create PDF from HTML";
        NSError *error = RCTErrorWithMessage(errorMessage);
        reject(@[error, [NSNull null]]);
    }
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRnHtmlToPdfSpecJSI>(params);
}
#endif

@end
