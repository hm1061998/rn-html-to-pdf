#import <React/RCTView.h>
#import <WebKit/WebKit.h>
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRnHtmlToPdfSpec.h"

@interface RnHtmlToPdf : NSObject <NativeRnHtmlToPdfSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RnHtmlToPdf : NSObject <RCTBridgeModule>
#endif


@end