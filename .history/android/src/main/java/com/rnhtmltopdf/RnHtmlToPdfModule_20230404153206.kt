package com.rnhtmltopdf

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

import android.graphics.BitmapFactory
import android.os.Environment
import android.util.Log
import com.itextpdf.text.Document
import com.itextpdf.text.Image
import com.itextpdf.text.html.simpleparser.HTMLWorker
import com.itextpdf.text.pdf.PdfWriter
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileOutputStream
import java.io.StringReader

import android.app.Activity

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
        val context: Activity = getCurrentActivity()
      try {
            val html: String = options.getString("html") ?: ""
            val fileName: String = options.getString("fileName") ?: ""
            val pdfLocation = File(context.getCacheDir().toString(), "${fileName}.pdf")
          
            val outputStream = FileOutputStream(pdfLocation)

            val document = Document()
            PdfWriter.getInstance(document, outputStream)

            document.open()

            val htmlWorker = HTMLWorker(document)

            htmlWorker.parse(StringReader(html))

            document.close()
            outputStream.close()

            promise.resolve(pdfLocation)
        } catch (e: Exception) {
            Log.e("MyPdfModule", "Error creating PDF from HTML", e)
            promise.reject("Error: ${e.message}")
        }

    
   
  }

   private fun getPdfFilePath(): File? {
        return File(Environment.getExternalStorageDirectory().toString() + "/Documents/")
    }

  companion object {
    const val NAME = "RnHtmlToPdf"
  }
}
