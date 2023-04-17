package com.handle  
  
import com.itextpdf.layout.Document 
import com.itextpdf.kernel.events.IEventHandler
import com.itextpdf.kernel.events.PdfDocumentEvent
import com.itextpdf.layout.properties.TextAlignment
import com.itextpdf.layout.properties.VerticalAlignment
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.renderer.ParagraphRenderer
import com.itextpdf.layout.layout.LayoutArea
import com.itextpdf.layout.layout.LayoutContext
import com.itextpdf.layout.layout.LayoutResult
import com.itextpdf.kernel.geom.PageSize
import com.itextpdf.kernel.geom.Rectangle
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.events.Event

class PageNumberHandler(document: Document, font: PdfFont) : IEventHandler {
    private val rootDoc: Document
    private val fontName: PdfFont
    private var maxPage: Int
    private var enabled: Boolean 
    
    init {
      rootDoc = document
      fontName = font
      maxPage = 9999999999.toInt()
      enabled = true
    }

    fun setMaxPage(num: Int) {
        maxPage = num
    }

    fun setEnabled(bool: Boolean) {
        enabled = bool
    }
    
    fun getRealParagraphWidth(doc: Document, paragraph: Paragraph): Float {
    // Create renderer tree
      val paragraphRenderer = paragraph.createRendererSubTree()
      // Do not forget setParent(). Set the dimensions of the viewport as needed
      val result = paragraphRenderer.setParent(doc.renderer)
          .layout(LayoutContext(LayoutArea(1, Rectangle(1000f, 100f))))
      // LayoutResult#getOccupiedArea() contains the information you need
      //return result.getOccupiedArea().getBBox().getWidth();
      return (paragraphRenderer as ParagraphRenderer).minMaxWidth.maxWidth
    }

    override fun handleEvent(event: Event) {
     if(enabled){
       val docEvent = event as PdfDocumentEvent
        val pdfDoc = docEvent.document
        val page = docEvent.page
        val pageNumber = pdfDoc.getPageNumber(page)

        if(pageNumber <= maxPage ){
          val paragraph = Paragraph("${pageNumber}")
          paragraph.setFont(fontName)
          val widthString = getRealParagraphWidth(rootDoc, paragraph)
          val xString = (PageSize.A4.width - widthString )/ 2 
          val yString = 10f
        
         //thêm số trang vào cuối trang
          rootDoc.showTextAligned(
            paragraph,
            xString,
            yString, 
            pageNumber, 
            TextAlignment.CENTER, 
            VerticalAlignment.BOTTOM, 
            0f
          )
        }
        else{
          enabled = false
        }
     }
       
    }
}