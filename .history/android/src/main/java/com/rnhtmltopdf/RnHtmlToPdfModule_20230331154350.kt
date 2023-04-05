package com.rnhtmltopdf

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

import android.app.Activity
import android.content.Context

import io.github.mddanishansari.html_to_pdf.HtmlToPdfConvertor
import java.io.File
import android.os.Build
import android.os.Bundle
import android.os.Environment

class RnHtmlToPdfModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }

  @ReactMethod
  fun convert(options: ReadableMap,  promise: Promise) {
    val context: Context = getCurrentContext() 

    val htmlToPdfConvertor = HtmlToPdfConvertor(context)

    val html: String = options.getString("html")?:""
    val fileName: String = options.getString("fileName")?:""

    val pdfLocation = File(getPdfFilePath(), "${fileName}.pdf")

    htmlToPdfConvertor.convert(
          pdfLocation = pdfLocation,
          htmlString = html,
          onPdfGenerationFailed = { exception ->
              // something went wrong, stop loading and log the exception
                promise.resolve(exception)
          },
          onPdfGenerated = { pdfFile ->
              // pdf was generated, stop the loading and open it
          
               promise.resolve(pdfFile)
          })
          
   
  }

   private fun getPdfFilePath(): File? {
        return File(Environment.getExternalStorageDirectory().toString() + "/Documents/")
    }

  companion object {
    const val NAME = "RnHtmlToPdf"
  }
}
