package com.rnhtmltopdf

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

import android.os.Environment
import android.util.Log
import com.itextpdf.html2pdf.HtmlConverter
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.kernel.geom.PageSize
import java.io.File
import java.io.FileOutputStream
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

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
       val context: Activity? = getCurrentActivity()
      try {
            var html: String = options.getString("html") ?: ""
            val fileName: String = options.getString("fileName") ?: ""


             var dir : String
              if(context == null){
                dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString()
              }
              else{
                dir = context.getCacheDir().toString()
              }
        

            val filePath = "${dir}/${fileName}.pdf"
            val file = File(filePath)

          

            val outputStream = FileOutputStream(file)
            val writer = PdfWriter(outputStream)
            val pdfDocument = PdfDocument(writer)
            pdfDocument.setDefaultPageSize(PageSize.A4) 

           val page = PdfPage(pdfDocument, PageSize.A4)

            val pageSize = page.getPageSize()
           
            html = html.replace("width:100$", "width:" + pageSize.getWidth() + "px")
            html = html.replace("height:100$", "height:" + pageSize.getHeight() + "px")
            val inputStream = ByteArrayInputStream(html.toByteArray(StandardCharsets.UTF_8))

            HtmlConverter.convertToPdf(inputStream, pdfDocument)

            writer.close()
            outputStream.close()

            promise.resolve(filePath)
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
