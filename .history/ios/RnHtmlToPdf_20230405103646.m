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
    // NSData *htmlData = [htmlString dataUsingEncoding:NSUTF8StringEncoding];
    // NSDictionary *options2 = @{NSDocumentTypeDocumentAttribute: NSHTMLTextDocumentType};
    // NSAttributedString *attributedString = [[NSAttributedString alloc] initWithData:htmlData options:options2 documentAttributes:nil error:nil];
    
    // // Create PDF from NSAttributedString
    // PDFDocument *pdfDocument = [[PDFDocument alloc] init];
    // PDFPage *pdfPage = [[PDFPage alloc] initWithAttributedText:attributedString];
    // [pdfDocument insertPage:pdfPage atIndex:pdfDocument.pageCount];
   // Tạo một bức ảnh từ chuỗi HTML
      NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithData:[htmlString dataUsingEncoding:NSUTF8StringEncoding]
                                                                                              options:@{NSDocumentTypeDocumentAttribute:NSHTMLTextDocumentType}
                                                                                  documentAttributes:nil error:nil];
      CGSize size = CGSizeMake(595, 842); // Kích thước trang A4
      UIGraphicsBeginImageContextWithOptions(size, NO, 0);
      [attributedString drawInRect:CGRectMake(0, 0, size.width, size.height)];
      UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
      UIGraphicsEndImageContext();

      // Tạo một file PDF từ bức ảnh
      NSString *pdfFileName = @"myPdfFile.pdf";
      NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
      NSString *documentsDirectory = [paths objectAtIndex:0];
      NSString *pdfPath = [documentsDirectory stringByAppendingPathComponent:pdfFileName];

      // Tạo đối tượng CGPDFContext để tạo file PDF
      CGRect mediaBox = CGRectMake(0, 0, size.width, size.height);
      CGContextRef pdfContext = CGPDFContextCreateWithURL((__bridge CFURLRef)[NSURL fileURLWithPath:pdfPath], &mediaBox, NULL);

      // Bắt đầu trang PDF
      CGPDFContextBeginPage(pdfContext, NULL);

      // Vẽ bức ảnh lên trang PDF
      CGContextDrawImage(pdfContext, mediaBox, image.CGImage);

      // Kết thúc trang PDF
      CGPDFContextEndPage(pdfContext);

      // Đóng file PDF
      CGPDFContextClose(pdfContext);

      resolve(pdfPath);
    
    // Save PDF to file
    // NSURL *tempDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
    // NSURL *pdfFileURL = [tempDirURL URLByAppendingPathComponent:@"example.pdf"];
    // BOOL success = [pdfDoc writeToFile:[pdfFileURL path]];
    
    // if (success) {
    //     resolve([pdfFileURL path]);
    // } else {
    //     NSString *errorMessage = @"Failed to create PDF from HTML";
    //     NSError *error = RCTErrorWithMessage(errorMessage);
    //     reject();
    // }
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
