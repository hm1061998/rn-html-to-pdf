#import "RnHtmlToPdf.h"

#import <PDFKit/PDFKit.h>
#import <HTMLReader/HTMLReader.h>
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
    PDFDocument *pdfDocument = [[PDFDocument alloc] init];
    PDFPage *pdfPage = [[PDFPage alloc] init];
    
    // Create HTML parser and document
    HTMLDocument *htmlDocument = [HTMLDocument documentWithString:htmlString];
    
    // Set up PDF graphics context
    UIGraphicsBeginPDFContextToData(pdfData, CGRectZero, nil);
    CGContextRef pdfContext = UIGraphicsGetCurrentContext();
    
    // Iterate over HTML document and add text and images to PDF page
    for (HTMLElement *element in [htmlDocument.rootElement flattenedElements]) {
        if (element.nodeType == HTMLTextNode) {
            // Add text node to PDF page
            NSAttributedString *attributedString = [[NSAttributedString alloc] initWithString:element.textContent attributes:nil];
            [pdfPage drawString:attributedString inRect:element.bounds];
        } else if ([element.tagName isEqualToString:@"img"]) {
            // Add image node to PDF page
            NSString *imageURLString = element.attributes[@"src"];
            UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:imageURLString]]];
            [pdfPage drawImage:image inRect:element.bounds];
        }
    }
    
    // Add PDF page to PDF document
    [pdfDocument insertPage:pdfPage atIndex:0];
    
    // Finalize PDF document
    UIGraphicsEndPDFContext();
    // Lưu document PDF vào file
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *pdfFilePath = [documentsDirectory stringByAppendingPathComponent:@"example.pdf"];
    [pdfDocument writeToFile:pdfFilePath];

    resolve(pdfFilePath)
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
