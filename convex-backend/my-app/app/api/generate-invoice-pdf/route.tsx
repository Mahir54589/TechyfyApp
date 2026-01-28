import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import InvoiceDocument from "../../../components/InvoiceDocument";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      invoiceNumber,
      date,
      customerName,
      customerAddress,
      customerPhone,
      items,
      netTotal,
      discountNet,
      deliveryCharge,
      grandTotal
    } = body;
    
    if (!invoiceNumber || !customerName || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate PDF using the component directly
    /* eslint-disable react-hooks/error-boundaries */
    const pdfBlob = await pdf(
      <InvoiceDocument
        invoiceNumber={invoiceNumber}
        date={date}
        customerName={customerName}
        customerAddress={customerAddress}
        customerPhone={customerPhone}
        items={items}
        netTotal={netTotal}
        discountNet={discountNet || 0}
        deliveryCharge={deliveryCharge || 0}
        grandTotal={grandTotal}
      />
    ).toBlob();
    /* eslint-enable react-hooks/error-boundaries */
    
    // Convert Blob to ArrayBuffer for NextResponse
    const arrayBuffer = await pdfBlob.arrayBuffer();
    
    // Return PDF as response
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${invoiceNumber}_${customerName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: "Failed to generate PDF", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
