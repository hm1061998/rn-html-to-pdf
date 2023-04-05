package com.rnhtmltopdf

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

import android.os.Environment
import android.util.Log
import com.itextpdf.html2pdf.HtmlConverter
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfReader

import java.io.File
import java.io.FileOutputStream
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

import android.util.Base64
import java.io.IOException
import java.io.RandomAccessFile

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
            val isBase64: Boolean = if(options.hasKey("base64")) options.getBoolean("base64") else false


            var dir : String
            if(context == null){
              dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS).toString()
            }
            else{
              dir = context.getCacheDir().toString()
            }
        

            val filePath = "${dir}/${fileName}.pdf"
            val file = File(filePath)

            val outputStream = FileOutputStream(file)
           
            HtmlConverter.convertToPdf(html, outputStream)

            val pdfDoc = PdfDocument(PdfReader(file))

            val numberOfPages = pdfDoc.numberOfPages
            pdfDoc.close()
            outputStream.close()

            val result: WritableMap = WritableNativeMap()

            var base64: String? = ""
            if(isBase64){
              base64 = encodeFromFile(file)
            }
            result.putString("filePath", filePath)
            result.putString("base64", base64)
            result.putString("numberOfPages", numberOfPages)
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e("MyPdfModule", "Error creating PDF from HTML", e)
            promise.reject("Error: ${e.message}")
        }

    
   
  }

   private fun encodeFromFile(file: File): String {
    val randomAccessFile = RandomAccessFile(file, "r")
    val fileBytes = ByteArray(randomAccessFile.length().toInt())
    randomAccessFile.readFully(fileBytes)
    return Base64.encodeToString(fileBytes, Base64.DEFAULT)
}

  companion object {
    const val NAME = "RnHtmlToPdf"
  }
}
