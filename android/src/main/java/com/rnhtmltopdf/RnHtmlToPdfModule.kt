package com.rnhtmltopdf
import android.graphics.*

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule


import android.util.Log
import com.itextpdf.html2pdf.HtmlConverter
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfReader
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.kernel.utils.PdfMerger
import com.itextpdf.layout.Document
import com.itextpdf.kernel.geom.PageSize
import com.itextpdf.layout.element.Image
import com.itextpdf.io.image.ImageDataFactory
import com.itextpdf.io.font.constants.StandardFonts
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.kernel.events.IEventHandler
import com.itextpdf.kernel.events.PdfDocumentEvent
import com.itextpdf.layout.element.AreaBreak
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import com.itextpdf.layout.element.Tab
import com.itextpdf.layout.element.TabStop
import com.itextpdf.layout.properties.TabAlignment
import com.itextpdf.kernel.pdf.action.PdfAction
import com.itextpdf.kernel.pdf.canvas.draw.DashedLine
import com.itextpdf.kernel.colors.ColorConstants
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.events.Event

import java.io.File
import java.io.FileOutputStream


import android.util.Base64
import java.io.RandomAccessFile
import android.widget.Toast

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.ExifInterface
import android.graphics.Matrix
import java.io.ByteArrayOutputStream

import java.util.*
import kotlin.math.min
import android.app.Activity

import com.handle.PageNumberHandler  


class RnHtmlToPdfModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }


  @ReactMethod
  fun createPDFFromImages(options: ReadableMap, promise: Promise) {
    val activity: Activity = currentActivity as Activity

    var pages: ReadableArray = options.getArray("pages") ?: Arguments.createArray()
    val fileName: String = options.getString("fileName") ?: "RNITP"
    val isBase64: Boolean = if(options.hasKey("base64")) options.getBoolean("base64") else false
    val fontName: String? = if(options.hasKey("fontName")) options.getString("fontName") else null
    val isPaginate: Boolean = if(options.hasKey("isPaginate")) options.getBoolean("isPaginate") else false
    val padding: Int = if(options.hasKey("padding")) options.getInt("padding") else 50
    val menuTitle: String = if(options.hasKey("menuTitle")) options.getString("menuTitle") ?: "Menu" else "Menu"

    var dir : String = activity.getCacheDir().toString()
    
    val filePath = "${dir}/${fileName}.pdf"
    val file = File(filePath)
    val pdfDocument = PdfDocument(PdfWriter(FileOutputStream(file)))

    var document = Document(
        pdfDocument,
        PageSize.A4
      )
    document.setMargins(padding.toFloat(), 0f, padding.toFloat(), 0f)
    document.setTextAlignment(TextAlignment.JUSTIFIED)
  
    document.setFontSize(14f)

    var font: PdfFont 
    if(fontName !== null){
      font = PdfFontFactory.createFont("assets/fonts/${fontName}.ttf")
    }
    else {
      font = PdfFontFactory.createFont(StandardFonts.TIMES_ROMAN)
    }

    document.setFont(font)
    
    //tạo sự kiện thêm đánh số trang
    val pageNumberHandle = PageNumberHandler(document, font)

    //lắng nghe sự kiện kết thúc trang và đánh số
    if(isPaginate){
      pdfDocument.addEventHandler(PdfDocumentEvent.END_PAGE, pageNumberHandle)
    }
  
    val pageSize = PageSize.A4
    val width = pageSize.getWidth()
    val height = pageSize.getHeight()
    val imageWidth = width - padding
    val imageHeight = height - padding

    val toc = Arguments.createArray() //tạo mảng chưa danh sách mục lục

    //lặp qua danh sách pages đầu vào để tạo các trang pdf
    for (i in 0 until pages.size()) {

        val currentPageNumber = pdfDocument.numberOfPages   // số trang hiện tại
        // val imagePath = imageList.getString(i)
        val imagePath = pages.getMap(i).getString("image")
        val contentText: String? = if(pages.getMap(i).hasKey("content")) pages.getMap(i).getString("content") else null
        // val bitmap = removeShadowAndBrightenImage(getImageFromFilePath(imagePath.replace("file://","")))
        // val bitmap = getImageFromFilePath(imagePath.replace("file://",""))
        // val imageData = ImageDataFactory.create(
        //     convertBitmapToByteArray(bitmap)
        //   )
        val imageData = ImageDataFactory.create(imagePath)
        val image = Image(imageData)
        image.scaleToFit(imageWidth, imageHeight)
        val x = (width - image.getImageScaledWidth()) / 2
        val y = (height - image.getImageScaledHeight()) / 2
      
        image.setFixedPosition(currentPageNumber + 1, x, y )  //thêm ảnh vào trang tiếp theo
       
        document.add(image)

        val page = pdfDocument.getPage(currentPageNumber + 1)
        //giải phóng bộ nhớ
        page.flush(true)


        // chèn ghi chú vào trang tiếp theo
        if(contentText != null){
          val contentTitle: String = if(pages.getMap(i).hasKey("title")) pages.getMap(i).getString("title") ?: "No Name" else "No Name"

          //tiêu đề ghi chú
          val paragraphTitle = Paragraph()
                                  .add(contentTitle)
                                  .setFont(font)
                                  .setFontSize(16f)
                                  .setBold()
                                  .setTextAlignment(TextAlignment.CENTER)
                                  .setWidth(width)
                                  .setMargins(0f, 0f, 20f, 0f);

          //nội dung ghi chú
          val paragraph = Paragraph()
                            .add(contentText)
                            .setFont(font)
                            .setPaddings(0f, padding.toFloat(), 0f, padding.toFloat())
                            .setMargins(0f, 0f, 0f, 0f);

          document.add(AreaBreak()) //tạo 1 trang mới để thêm ghi chú

          val page2 = pdfDocument.getPage(currentPageNumber + 2) //trang thêm ghi chú
          pdfDocument.dispatchEvent(PdfDocumentEvent(PdfDocumentEvent.END_PAGE, page2)) //kích hoạt sự kiện kết thúc trang để đánh số

          document.add(paragraphTitle)
          document.add(paragraph)

          pdfDocument.dispatchEvent(PdfDocumentEvent(PdfDocumentEvent.END_PAGE, pdfDocument.getPage(pdfDocument.numberOfPages))) //đánh số cho trang cuối cùng

        
         //thêm vào mục lục
          val tocItem = Arguments.createMap().apply{
              putString("title", contentTitle)
              putInt("pageNum", currentPageNumber + 2)
          }

          toc.pushMap(tocItem)
         
        }
    }


        
    val numberOfPages = pdfDocument.numberOfPages // số trang pdf hiện tại

    if(toc.size() > 0){
      // pageNumberHandle.setMaxPage(numberOfPages)
      document.add(AreaBreak()) //thêm trang mới để tạo menu
      if(isPaginate){
        pdfDocument.removeEventHandler(PdfDocumentEvent.END_PAGE, pageNumberHandle) // loại bỏ sự kiện đánh số trang để không đánh số cho mục lục
      }

     


      // tiêu đề mục lục
      val _titleMenu = Paragraph()
                        .add(menuTitle)
                        .setFont(font)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER)
                        .setWidth(width)
                        .setMargins(10f, 0f, 10f, 0f);

      document.add(_titleMenu)


      val tocWidth = width - padding  // độ rộng của bảng mục lục

      //lặp qua danh sách để tạo mục lục
      for(i in 0 until toc.size()){
          val title = toc.getMap(i).getString("title")
          val pageNum = toc.getMap(i).getInt("pageNum")
          val p = Paragraph()
                    .addTabStops(TabStop(tocWidth, TabAlignment.RIGHT, DashedLine()))
                    .add(title)
                    .add(Tab())
                    .add(pageNum.toString())
                    .setAction(PdfAction.createGoTo("p${pageNum}"))
                    .setMargins(0f, width - tocWidth, 0f, width - tocWidth )
                    .setMultipliedLeading(1f)
                    .setFont(font)
                    .setFontColor(ColorConstants.BLUE);
          document.add(p)   
      }

      
      val newPageNumber = pdfDocument.numberOfPages - numberOfPages //lấy ra số lượng trang mục lục = tổng số trang pdf  - số trang hiện tại

      // đưa các trang mục lục lên đầu file pdf
      for(i in 0 until newPageNumber){
        try{
          pdfDocument.movePage(pdfDocument.numberOfPages , 1);
        }
        catch(e: Exception){
            // Log.e("MyPdfModule", "Error creating PDF from IMAGES", e)
            // Toast.makeText(activity.getApplicationContext(), "move page error: ${e}", Toast.LENGTH_LONG).show()
        }
        
      }
    
    }

      
      
    //kết thúc tạo pdf
    document.close()

    val result: WritableMap = WritableNativeMap()

    var base64: String? = ""
    if(isBase64){
      base64 = encodeFromFile(file)
    }
    result.putString("filePath", filePath)
    result.putString("base64", base64)
    result.putInt("numberOfPages", numberOfPages)
    promise.resolve(result)

  }


  @ReactMethod
  fun convert(options: ReadableMap,  promise: Promise) {
      val context: Activity = currentActivity as Activity
      try {
            var html: String = options.getString("html") ?: ""
            val fileName: String = options.getString("fileName") ?: ""
            val isBase64: Boolean = if(options.hasKey("base64")) options.getBoolean("base64") else false

            var dir : String = context.getCacheDir().toString()
           
            val filePath = "${dir}/${fileName}.pdf"
            val file = File(filePath)

            val outputStream = FileOutputStream(file)

            HtmlConverter.convertToPdf(html, outputStream)

            val pdfDoc = PdfDocument(PdfReader(file))

            val numberOfPages = pdfDoc.numberOfPages?: 0
            pdfDoc.close()
            outputStream.close()

            val result: WritableMap = WritableNativeMap()

            var base64: String? = ""
            if(isBase64){
              base64 = encodeFromFile(file)
            }
            result.putString("filePath", filePath)
            result.putString("base64", base64)
            result.putInt("numberOfPages", numberOfPages)
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e("MyPdfModule", "Error creating PDF from HTML", e)
            promise.reject("Error: ${e.message}")
        }
  }

  


  // Phương thức chuyển đổi bitmap thành mảng byte
  private fun convertBitmapToByteArray(bitmap: Bitmap): ByteArray {
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)
    return stream.toByteArray()
  }

  private fun encodeFromFile(file: File): String {
    val randomAccessFile = RandomAccessFile(file, "r")
    val fileBytes = ByteArray(randomAccessFile.length().toInt())
    randomAccessFile.readFully(fileBytes)
    return Base64.encodeToString(fileBytes, Base64.DEFAULT)
  }

  private fun getImageFromFilePath(filePath: String): Bitmap {
  // convert image matrix to bitmap
    val origBitmap = BitmapFactory.decodeFile(filePath)

    val exif: ExifInterface = ExifInterface(filePath)    //Since API Level 5
    val exifOrientation:Int = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, -1)
    val matrix = Matrix()
    if (exifOrientation == ExifInterface.ORIENTATION_ROTATE_90) {
      matrix.postRotate(90.toFloat())
    }
    val bitmap = Bitmap.createBitmap(origBitmap, 0, 0, origBitmap.getWidth(), origBitmap.getHeight(), matrix, true)
    
    return bitmap

  }

  
  companion object {
    const val NAME = "RnHtmlToPdf"
  }

}



