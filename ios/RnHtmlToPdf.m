#import "RnHtmlToPdf.h"

#import <CoreGraphics/CoreGraphics.h>
#import <UIKit/UIKit.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTView.h>
#import <React/RCTLog.h>
#import <React/UIView+React.h>
#import <React/RCTUtils.h>
#import <PDFKit/PDFKit.h>
#import <CoreText/CoreText.h>

#define PDFSize CGSizeMake(595,842)

@implementation UIPrintPageRenderer (PDF)
- (NSData*) printToPDF:(NSInteger**)_numberOfPages
                   backgroundColor:(UIColor*)_bgColor
{
    NSMutableData *pdfData = [NSMutableData data];
    UIGraphicsBeginPDFContextToData( pdfData, self.paperRect, nil );

    [self prepareForDrawingPages: NSMakeRange(0, self.numberOfPages)];

    CGRect bounds = UIGraphicsGetPDFContextBounds();

    for ( int i = 0 ; i < self.numberOfPages ; i++ )
    {
        UIGraphicsBeginPDFPage();


        CGContextRef currentContext = UIGraphicsGetCurrentContext();
        CGContextSetFillColorWithColor(currentContext, _bgColor.CGColor);
        CGContextFillRect(currentContext, self.paperRect);

        [self drawPageAtIndex: i inRect: bounds];
    }

    *_numberOfPages = self.numberOfPages;

    UIGraphicsEndPDFContext();
    return pdfData;
}
@end

@implementation RnHtmlToPdf {
    RCTEventDispatcher *_eventDispatcher;
    RCTPromiseResolveBlock _resolveBlock;
    RCTPromiseRejectBlock _rejectBlock;
    NSString *_html;
    NSString *_fileName;
    NSString *_filePath;
    UIColor *_bgColor;
    NSInteger *_numberOfPages;
    CGSize _PDFSize;
    WKWebView *_webView;
    float _paddingBottom;
    float _paddingTop;
    float _paddingLeft;
    float _paddingRight;
    BOOL _base64;
    BOOL autoHeight;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@synthesize bridge = _bridge;

- (instancetype)init
{
    if (self = [super init]) {
        _webView = [[WKWebView alloc] initWithFrame:self.bounds];
        _webView.navigationDelegate = self;
        [self addSubview:_webView];
        autoHeight = false;
    }
    return self;
}

RCT_EXPORT_METHOD(createPDFFromImages:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

      NSArray *pages = options[@"pages"] ? [RCTConvert NSArray:options[@"pages"]] : @[];
      NSString *fileName = options[@"fileName"] ? [RCTConvert NSString:options[@"fileName"]] : @"RNITP";
      NSString *fontName = options[@"fontName"] ? [RCTConvert NSString:options[@"fontName"]] : @"Roboto";
      NSString *menuTitle = options[@"menuTitle"] ? [RCTConvert NSString:options[@"menuTitle"]] : @"Menu";
      BOOL base64 = options[@"base64"] ? [RCTConvert BOOL:options[@"base64"]] : false;
      BOOL isPaginate = options[@"isPaginate"] ? [RCTConvert BOOL:options[@"isPaginate"]] : false;
      float padding = options[@"padding"] ? [RCTConvert float:options[@"padding"]] : 50.0f;

      // Tạo đường dẫn lưu trữ tài liệu PDF
      NSArray *documentDirectories = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
      NSString *documentDirectory = [documentDirectories objectAtIndex:0];
      NSString *pdfPath = [NSString stringWithFormat:@"%@/%@.pdf", documentDirectory, fileName];
      NSURL *pdfURL = [NSURL fileURLWithPath:pdfPath];

      // Tạo PDFDocument
      // CGFloat padding = 20;
        // Tạo một tài liệu PDF
      CGRect pageRect = CGRectMake(0, 0, PDFSize.width , PDFSize.height ); // Kích thước trang A4

      UIGraphicsBeginPDFContextToFile(pdfPath, pageRect, nil);

      CGRect imageRect = CGRectMake(padding, padding, PDFSize.width -  2 * padding, PDFSize.height - 2 * padding); 

      NSInteger pageNumber = 0;

    

      NSMutableArray *tableOfContents = [NSMutableArray array];

      UIFont *customFont = [UIFont fontWithName:fontName size:16.0];
      // Lấy một font descriptor từ font custom
      UIFontDescriptor *fontDescriptor = [customFont fontDescriptor];

      // Tạo một font descriptor mới với chế độ in đậm
      // UIFontDescriptor *boldFontDescriptor = [fontDescriptor fontDescriptorWithSymbolicTraits:UIFontDescriptorTraitBold];

      // UIFont *font = [UIFont fontWithDescriptor:fontDescriptor size:14.0];
      UIFont *font = [UIFont systemFontOfSize:14.0];

         // Tạo thuộc tính văn bản để định dạng số trang
      NSMutableDictionary *pageNumberAttributes = [[NSMutableDictionary alloc] init];
      [pageNumberAttributes setObject:font forKey:NSFontAttributeName];
      [pageNumberAttributes setObject:[UIColor blackColor] forKey:NSForegroundColorAttributeName];
      // Vẽ các trang PDF
      for (NSDictionary *page in pages) {
          pageNumber++;
          // Bắt đầu một trang mới
          UIGraphicsBeginPDFPageWithInfo(pageRect, nil);
          NSURL *imagePath = [RCTConvert NSURL:page[@"image"]];
          UIImage *image = [self pathToUIImage:imagePath];

          CGRect imagePageRect = imageRect;
          CGFloat aspectRatio = image.size.width / image.size.height;
          if (aspectRatio > 1) {
              // Nếu ảnh ngang hơn dọc, tính toán lại chiều cao để tỷ lệ với chiều rộng của trang PDF
              CGFloat newHeight = imagePageRect.size.width / aspectRatio;
              CGFloat offsetY = (imagePageRect.size.height - newHeight) / 2;
              imagePageRect = CGRectMake(imagePageRect.origin.x, imagePageRect.origin.y + offsetY, imagePageRect.size.width, newHeight);
          } else {
              // Nếu ảnh dọc hơn ngang, tính toán lại chiều rộng để tỷ lệ với chiều cao của trang PDF
              CGFloat newWidth = imagePageRect.size.height * aspectRatio;
              CGFloat offsetX = (imagePageRect.size.width - newWidth) / 2;
              imagePageRect = CGRectMake(imagePageRect.origin.x + offsetX, imagePageRect.origin.y, newWidth, imagePageRect.size.height);
          }

          [image drawInRect:imagePageRect];
      
          if(isPaginate){
            [self drawPaginate:pageNumber pageAttributes:pageNumberAttributes inRect:pageRect];
          }
        

    
          if(page[@"content"]){
           
              NSString *contentText = [RCTConvert NSString:page[@"content"]] ;
              NSArray *pageSplits = [self findPageSplits:contentText size: CGSizeMake(PDFSize.width -  4 * padding, PDFSize.height - 4 * padding) font:font];
            
              int location = 0;

               NSString *title = [RCTConvert NSString:page[@"title"]];
              [tableOfContents addObject:@{@"title": title, @"page": @(pageNumber+1)}];

              for (NSNumber *splitLength in pageSplits) {
                  pageNumber++;
                  UIGraphicsBeginPDFPageWithInfo(pageRect, nil);
                  NSInteger length = [splitLength integerValue];
                  NSRange range = NSMakeRange(location, length);
                  NSString *subString = [contentText substringWithRange:range];

                  CGRect contentRect = imageRect;


                  //nếu là trang đầu tiên thì vẽ thêm tiêu đề
                  if(location == 0){
                     

                      // Tạo một đối tượng UIFont với font descriptor mới
                      // UIFont *boldCustomFont = [UIFont fontWithDescriptor:fontDescriptor size:14.0];

                      // Tạo một NSMutableParagraphStyle object
                      NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
                      // Thiết lập alignment cho canh giữa
                      paragraphStyle.alignment = NSTextAlignmentCenter;

                      NSDictionary *attributes = @{NSFontAttributeName:font, NSForegroundColorAttributeName:[UIColor blackColor], NSParagraphStyleAttributeName: paragraphStyle };
                      NSAttributedString *titleAttributedString = [[NSAttributedString alloc] initWithString:title attributes:attributes];
                      CGSize size = [title sizeWithAttributes:attributes];
                      CGPoint point = CGPointMake(padding + (imageRect.size.width - size.width) / 2.0, 30);


      
                      contentRect.origin.y+= 40 ;

                      [titleAttributedString drawAtPoint:point];
                        // [titleAttributedString drawInRect:rect];
                  }
                  
                  NSAttributedString *contentAttributedString = [[NSAttributedString alloc] initWithString:subString attributes:pageNumberAttributes];
                  [contentAttributedString drawInRect:contentRect];

                  // Cập nhật tọa độ vẽ
                  location += length;

                  if(isPaginate){
                    [self drawPaginate:pageNumber pageAttributes:pageNumberAttributes inRect:pageRect];
                  }
                  
              }

      
          }

      }


        // Lưu tài liệu PDF
    // Kết thúc tài liệu PDF
    UIGraphicsEndPDFContext();

    NSData *pdfData = [NSData dataWithContentsOfFile:pdfPath];

    [pdfData writeToFile:pdfPath atomically:YES];


    //nếu có ghi chú thì vẽ menu
    if([tableOfContents count] > 0){

      // Tạo đối tượng đọc tài liệu PDF
      CGPDFDocumentRef pdfDocument = CGPDFDocumentCreateWithURL((__bridge CFURLRef)[NSURL fileURLWithPath:pdfPath]);

      // Lấy số trang của tài liệu PDF
      NSInteger pageCount = CGPDFDocumentGetNumberOfPages(pdfDocument);


      UIGraphicsBeginPDFContextToFile(pdfPath, pageRect, nil);


      UIGraphicsBeginPDFPageWithInfo(pageRect, nil);
    
      CGContextRef context = UIGraphicsGetCurrentContext();

      // Vẽ văn bản cho mục lục
      // UIFont *font1 = [UIFont fontWithDescriptor:fontDescriptor size:18.0];
      NSDictionary *attributes = @{NSFontAttributeName:font, NSForegroundColorAttributeName:[UIColor blackColor]};

      CGSize size = [menuTitle sizeWithAttributes:attributes];
      CGPoint point = CGPointMake(padding + (imageRect.size.width - size.width) / 2.0, 50);
      [menuTitle drawAtPoint:point withAttributes:attributes];


      // UIFont *font2 = [UIFont fontWithDescriptor:fontDescriptor size:14.0];
      NSDictionary *attributes2 = @{NSFontAttributeName:font, NSForegroundColorAttributeName:[UIColor blackColor]};      


      // Thiết lập thông số cho đường kẻ chấm
      CGContextSetLineWidth(context, 1.0);
      CGContextSetStrokeColorWithColor(context, [UIColor blackColor].CGColor);
      CGFloat dashes[] = {2.0, 2.0};
      CGContextSetLineDash(context, 0, dashes, 2);
      
      int menuPageCount = 1;
      BOOL firstPage = true;

      //vẽ menu
      for (NSDictionary *entry in tableOfContents) {
          NSString *title = entry[@"title"];
          NSInteger page = [entry[@"page"] integerValue];
          NSString *tocPageNumber = [NSString stringWithFormat:@"%ld", (long)page];

          CGFloat tocY = (firstPage ? 90.0 : 50.0) + 30 * menuPageCount;

          CGPoint tocTitlePoint = CGPointMake(padding, tocY);

          CGFloat tocPageX = imageRect.size.width;
          CGPoint tocPagePoint = CGPointMake(tocPageX, tocY);


          [title drawAtPoint:tocTitlePoint withAttributes:attributes2];
          [tocPageNumber drawAtPoint:tocPagePoint withAttributes:attributes2];

          CGSize tocSize = [title sizeWithAttributes:attributes2];
          CGSize tocPageSize = [tocPageNumber sizeWithAttributes:attributes2];


          CGFloat lineY = tocTitlePoint.y + tocSize.height; //vị trí trục y của đường kẻ
          CGContextMoveToPoint(context, tocPageX  - tocPageSize.width, lineY);  //vị trí kết thúc của đường kẻ = độ rộng của vùng chứa - độ rộng của số trang
          CGContextAddLineToPoint(context, tocSize.width + padding, lineY); //vị trí bắt đầu của đường kẻ = độ rộng của tiêu đề
          CGContextStrokePath(context);

          if(menuPageCount >= 23){
            menuPageCount = 1;
            firstPage = false;
            UIGraphicsBeginPDFPageWithInfo(pageRect, nil);
          }else{
            menuPageCount++;
          }
      }


      // Vẽ lại nội dung các trang PDF mới vào sau menu
      for (NSInteger pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
          // Bắt đầu một trang mới
          UIGraphicsBeginPDFPageWithInfo(pageRect, nil);


          // Thiết lập hệ tọa độ để bắt đầu ở góc trên cùng bên trái của trang
          CGContextTranslateCTM(context, 0, PDFSize.height);
          CGContextScaleCTM(context, 1.0, -1.0);
          
          // Lấy đối tượng CGPDFPageRef của trang cần vẽ
          CGPDFPageRef pdfPage = CGPDFDocumentGetPage(pdfDocument, pageIndex);
          
          // Vẽ lại nội dung của trang PDF ban đầu
          CGContextDrawPDFPage(context, pdfPage);
      }

      // Kết thúc vẽ tài liệu PDF mới
      UIGraphicsEndPDFContext();

      CGPDFDocumentRelease(pdfDocument);

    }
   
  

      // Tạo đối tượng đọc tài liệu PDF
    CGPDFDocumentRef pdfDocument = CGPDFDocumentCreateWithURL((__bridge CFURLRef)[NSURL fileURLWithPath:pdfPath]);

    // Lấy số trang của tài liệu PDF
    NSInteger pageCount = CGPDFDocumentGetNumberOfPages(pdfDocument);

    // Giải phóng bộ nhớ
    CGPDFDocumentRelease(pdfDocument);

    NSString *pdfBase64 = @"";

    if (base64) {
        pdfBase64 = [pdfData base64EncodedStringWithOptions:0];
    }
  
      NSDictionary *data = @{
              @"filePath":pdfPath,
              @"base64":pdfBase64,
              @"numberOfPages":@(pageCount),
              };
    resolve(data);
   
}


RCT_EXPORT_METHOD(convert:(NSDictionary *)options
                  resolvePromise:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

    if (options[@"html"]){
        _html = [RCTConvert NSString:options[@"html"]];
    }

    if (options[@"fileName"]){
        _fileName = [RCTConvert NSString:options[@"fileName"]];
    } else {
        _fileName = [[NSProcessInfo processInfo] globallyUniqueString];
    }

    // Default Color
    _bgColor = [UIColor colorWithRed: (246.0/255.0) green:(245.0/255.0) blue:(240.0/255.0) alpha:1];
    if (options[@"bgColor"]){
        NSString *hex = [RCTConvert NSString:options[@"bgColor"]];
        hex = [hex uppercaseString];
        NSString *cString = [hex stringByTrimmingCharactersInSet:
            [NSCharacterSet whitespaceAndNewlineCharacterSet]];

        if ((cString.length) == 7) {
            NSScanner *scanner = [NSScanner scannerWithString:cString];

            UInt32 rgbValue = 0;
            [scanner setScanLocation:1]; // Bypass '#' character
            [scanner scanHexInt:&rgbValue];

            _bgColor = [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 \
                                       green:((float)((rgbValue & 0x00FF00) >>  8))/255.0 \
                                        blue:((float)((rgbValue & 0x0000FF) >>  0))/255.0 \
                                       alpha:1.0];
        }
    }

    if (options[@"directory"] && [options[@"directory"] isEqualToString:@"Documents"]){
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsPath = [paths objectAtIndex:0];

        _filePath = [NSString stringWithFormat:@"%@/%@.pdf", documentsPath, _fileName];
    } else {
        _filePath = [NSString stringWithFormat:@"%@%@.pdf", NSTemporaryDirectory(), _fileName];
    }

    if (options[@"base64"] && [options[@"base64"] boolValue]) {
        _base64 = true;
    } else {
        _base64 = false;
    }

    if (options[@"height"] && options[@"width"]) {
        float width = [RCTConvert float:options[@"width"]];
        float height = [RCTConvert float:options[@"height"]];
        _PDFSize = CGSizeMake(width, height);
    } else {
        _PDFSize = PDFSize;
    }

    if (options[@"paddingBottom"]) {
        _paddingBottom = [RCTConvert float:options[@"paddingBottom"]];
    } else {
        _paddingBottom = 10.0f;
    }

    if (options[@"paddingLeft"]) {
        _paddingLeft = [RCTConvert float:options[@"paddingLeft"]];
    } else {
        _paddingLeft = 10.0f;
    }

    if (options[@"paddingTop"]) {
        _paddingTop = [RCTConvert float:options[@"paddingTop"]];
    } else {
        _paddingTop = 10.0f;
    }

    if (options[@"paddingRight"]) {
        _paddingRight = [RCTConvert float:options[@"paddingRight"]];
    } else {
        _paddingRight = 10.0f;
    }

    if (options[@"padding"]) {
        _paddingTop = [RCTConvert float:options[@"padding"]];
        _paddingBottom = [RCTConvert float:options[@"padding"]];
        _paddingLeft = [RCTConvert float:options[@"padding"]];
        _paddingRight = [RCTConvert float:options[@"padding"]];
    }

    NSString *path = [[NSBundle mainBundle] bundlePath];
    NSURL *baseURL = [NSURL fileURLWithPath:path];
    dispatch_async(dispatch_get_main_queue(), ^{
        [_webView loadHTMLString:_html baseURL:baseURL];
    });

    _resolveBlock = resolve;
    _rejectBlock = reject;

}


RCT_EXPORT_METHOD(mergePdf:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

      NSArray *pdfFiles = options[@"files"] ? [RCTConvert NSArray:options[@"files"]] : @[];

        // Tạo đường dẫn lưu trữ tài liệu PDF
      NSArray *documentDirectories = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
      NSString *documentDirectory = [documentDirectories objectAtIndex:0];
      NSString *defaultPdfPath = [NSString stringWithFormat:@"%@/%@.pdf", documentDirectory, @"RNITPDF"];


      NSString *mergedPdfFile = options[@"filePath"] ? [RCTConvert NSString:options[@"filePath"]] : defaultPdfPath;

     // Tạo một mảng tài liệu PDF
      NSMutableArray *pdfDocuments = [NSMutableArray array];

      // Duyệt qua mảng file PDF
      for (NSString *filePath in pdfFiles) {
          // Tạo một NSURL từ đường dẫn file
          NSURL *pdfURL = [NSURL fileURLWithPath:filePath];
          // Tạo một tài liệu PDF từ URL
          CGPDFDocumentRef pdfDoc = CGPDFDocumentCreateWithURL((__bridge CFURLRef)pdfURL);

          // NSData *pdfData = [NSData dataWithContentsOfFile:filePath];
          // CFDataRef dataRef = (__bridge CFDataRef)pdfData;
          // CGDataProviderRef provider = CGDataProviderCreateWithCFData(dataRef);
          // CGPDFDocumentRef pdfDoc = CGPDFDocumentCreateWithProvider(provider);
          // Kiểm tra xem tài liệu PDF đã được tạo thành công chưa
          if (pdfDoc != NULL && CGPDFDocumentIsEncrypted(pdfDoc) == false) {
              // Thêm tài liệu PDF vào mảng
              [pdfDocuments addObject:(__bridge id _Nonnull)(pdfDoc)];
          } else {
              RCTLogWarn(@"Failed to create PDF document from file: %@", filePath);
          }
      }

    // Tạo một đối tượng NSMutableData để lưu nội dung PDF kết hợp
    NSMutableData *combinedPDFData = [NSMutableData data];

    // Tạo một tài liệu PDF trống để bắt đầu ghi nội dung
    UIGraphicsBeginPDFContextToData(combinedPDFData, CGRectZero, nil);

    // Duyệt qua tất cả các tài liệu PDF và trang trong mỗi tài liệu
    for (NSUInteger i = 0; i < [pdfDocuments count]; i++) {
        CGPDFDocumentRef pdfDoc = (__bridge CGPDFDocumentRef)[pdfDocuments objectAtIndex:i];
        size_t numPages = CGPDFDocumentGetNumberOfPages(pdfDoc);
        for (size_t pageIndex = 1; pageIndex <= numPages; pageIndex++) {
            // Truy xuất trang PDF
            CGPDFPageRef pdfPage = CGPDFDocumentGetPage(pdfDoc, pageIndex);
            // Lấy kích thước trang PDF
            CGRect pageRect = CGPDFPageGetBoxRect(pdfPage, kCGPDFMediaBox);
            // Bắt đầu trang mới trong tài liệu PDF kết hợp
            UIGraphicsBeginPDFPageWithInfo(pageRect, nil);
            // Vẽ nội dung của trang PDF lên trang mới
            CGContextRef context = UIGraphicsGetCurrentContext();
            CGContextSaveGState(context);
            CGContextTranslateCTM(context, 0.0, pageRect.size.height);
            CGContextScaleCTM(context, 1.0, -1.0);
            CGContextDrawPDFPage(context, pdfPage);
            CGContextRestoreGState(context);
        }
    }

    // Kết thúc tài liệu PDF kết hợp
    UIGraphicsEndPDFContext();

    // Giải phóng các tài liệu PDF
    for (NSUInteger i = 0; i < [pdfDocuments count]; i++) {
         CGPDFDocumentRef pdfDoc = (__bridge CGPDFDocumentRef)[pdfDocuments objectAtIndex:i];
        CGPDFDocumentRelease(pdfDoc);
    }

    // Lấy dữ liệu PDF kết hợp đã được tạo ra
    NSData *combinedPDF = [NSData dataWithData:combinedPDFData];

    [combinedPDF writeToFile:mergedPdfFile atomically:YES];

      // Tạo đối tượng đọc tài liệu PDF
    CGPDFDocumentRef pdfDocument = CGPDFDocumentCreateWithURL((__bridge CFURLRef)[NSURL fileURLWithPath:mergedPdfFile]);

    // Lấy số trang của tài liệu PDF
    NSInteger pageCount = CGPDFDocumentGetNumberOfPages(pdfDocument);

    // Giải phóng bộ nhớ
    CGPDFDocumentRelease(pdfDocument);


       NSDictionary *data = @{
              @"filePath":mergedPdfFile,
              @"numberOfPage":@(pageCount)
              };

    resolve(data);

}


-(void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    if (webView.isLoading)
    return;
    
    UIPrintPageRenderer *render = [[UIPrintPageRenderer alloc] init];
    [render addPrintFormatter:webView.viewPrintFormatter startingAtPageAtIndex:0];
    
    // Define the printableRect and paperRect
    // If the printableRect defines the printable area of the page
    CGRect paperRect = CGRectMake(0, 0, _PDFSize.width, _PDFSize.height);
    CGRect printableRect = CGRectMake(_paddingLeft, _paddingTop, _PDFSize.width-(_paddingLeft + _paddingRight), _PDFSize.height-(_paddingBottom + _paddingTop));
    
    
    [render setValue:[NSValue valueWithCGRect:paperRect] forKey:@"paperRect"];
    [render setValue:[NSValue valueWithCGRect:printableRect] forKey:@"printableRect"];
    
    NSData * pdfData = [render printToPDF:&_numberOfPages backgroundColor:_bgColor ];
    
    if (pdfData) {
        NSString *pdfBase64 = @"";
        
        [pdfData writeToFile:_filePath atomically:YES];
        if (_base64) {
            pdfBase64 = [pdfData base64EncodedStringWithOptions:0];
        }
        NSDictionary *data = [NSDictionary dictionaryWithObjectsAndKeys:
                              pdfBase64, @"base64",
                              [NSString stringWithFormat: @"%ld", (long)_numberOfPages], @"numberOfPages",
                              _filePath, @"filePath", nil];
        _resolveBlock(data);
    } else {
        NSError *error;
        _rejectBlock(RCTErrorUnspecified, nil, RCTErrorWithMessage(error.description));
    }
}

-(void)drawPaginate:(NSInteger *)page pageAttributes: (NSMutableDictionary *)pageNumberAttributes inRect:(CGRect) rect{
    NSString *pageNumberString = [NSString stringWithFormat:@"%d", page];
    // Tạo đối tượng NSAttributedString từ chuỗi số trang và thuộc tính văn bản
    NSAttributedString *pageNumberAttributedString = [[NSAttributedString alloc] initWithString:pageNumberString attributes:pageNumberAttributes];

    // Lấy kích thước chuỗi số trang
    CGSize pageNumberSize = [pageNumberAttributedString size];

    // Tính toán vị trí để vẽ số trang
    CGFloat pageNumberX = (rect.size.width - pageNumberSize.width )/ 2;
    CGFloat pageNumberY = rect.size.height - pageNumberSize.height - 10;

    // Vẽ số trang lên trang PDF
    [pageNumberAttributedString drawAtPoint:CGPointMake(pageNumberX, pageNumberY)];
} 

-(NSArray*)findPageSplits:(NSString*)string size:(CGSize)size font:(UIFont*)font;
{
  NSMutableArray* result = [[NSMutableArray alloc] initWithCapacity:32];
  CTFontRef fnt = CTFontCreateWithName((CFStringRef)font.fontName, font.pointSize,NULL);
  CFAttributedStringRef str = CFAttributedStringCreate(kCFAllocatorDefault, 
                                                       (CFStringRef)string, 
                                                       (CFDictionaryRef)[NSDictionary dictionaryWithObjectsAndKeys:(__bridge id)fnt, kCTFontAttributeName, nil]);
  CTFramesetterRef fs = CTFramesetterCreateWithAttributedString(str);
  CFRange r = {0,0};
  CFRange res = {0,0};
  NSInteger str_len = [string length];
  do {
    CTFramesetterSuggestFrameSizeWithConstraints(fs,r, NULL, size, &res);
    r.location += res.length;
    [result addObject:[NSNumber numberWithInt:res.length]];
  } while(r.location < str_len);
//  NSLog(@"%@",result);
  CFRelease(fs);
  CFRelease(str);
  CFRelease(fnt);
  return result;
}  

- (UIImage *)pathToUIImage:(NSURL *)path {
  return [UIImage imageWithData:[NSData dataWithContentsOfURL:path]];
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
