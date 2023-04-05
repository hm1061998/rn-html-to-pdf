package com.rnhtmltopdf

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.common.PDRectangle
import org.apache.pdfbox.rendering.HTMLRenderer
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.net.URL


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
            val html: String = options.getString("html") ?: ""
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

            val document = PDDocument()
            val page = PDPage(PDRectangle.A4)
            document.addPage(page)
            val inputStream: InputStream = html!!.byteInputStream()
            val renderer = HTMLRenderer()
            val stripper = renderer.htmlParser.parse(inputStream)
            val device = renderer.newLayoutAwareDevice()
            val graphics = device.createRenderingContext()
            graphics.use {
                device.render(stripper.document, graphics)
            }
            device.end()
            document.save(File(outputFilePath))
            document.close()

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
