import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts using reliable TTF sources
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff2",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-500-normal.woff2",
      fontWeight: 500,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff2",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff2",
      fontWeight: 700,
    },
  ],
});

// Fallback to Helvetica if Inter fails to load
Font.registerHyphenationCallback((word) => [word]);

// Styles based on exact .pen file specifications
const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    backgroundColor: "#FFFFFF",
    paddingTop: 80,
    paddingBottom: 80,
    paddingLeft: 113,
    paddingRight: 113,
  },
  // Invoice Title
  invoiceTitle: {
    fontSize: 87,
    fontWeight: 700,
    color: "#000000",
    marginTop: 66,
    marginBottom: 40,
  },
  // Invoice Info Section
  invoiceInfo: {
    marginBottom: 30,
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceLabel: {
    fontSize: 30,
    fontWeight: 500,
    color: "#333333",
    width: 172,
    textAlign: "center",
  },
  invoiceValue: {
    fontSize: 30,
    fontWeight: 600,
    color: "#000000",
    marginLeft: 20,
  },
  // Billing Section
  billingContainer: {
    flexDirection: "row",
    marginTop: 40,
    marginBottom: 50,
  },
  billToSection: {
    width: "50%",
  },
  billerSection: {
    width: "50%",
  },
  billingTitle: {
    fontSize: 28,
    fontWeight: 500,
    color: "#000000",
    marginBottom: 20,
  },
  billingName: {
    fontSize: 28,
    color: "#000000",
    marginBottom: 10,
  },
  billingText: {
    fontSize: 28,
    color: "#333333",
    marginBottom: 5,
  },
  // Description Label
  descriptionLabel: {
    fontSize: 24,
    fontWeight: 400,
    color: "#2f2f2f",
    marginBottom: 15,
  },
  // Table Styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    height: 62,
    alignItems: "center",
    paddingHorizontal: 22,
  },
  tableHeaderText: {
    fontSize: 25,
    fontWeight: 600,
    color: "#000000",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    fontSize: 25,
    fontWeight: 400,
    color: "#333333",
    textAlign: "center",
  },
  // Column widths
  colSlNo: { width: "8%" },
  colItemName: { width: "32%", textAlign: "left" },
  colQuantity: { width: "12%" },
  colRate: { width: "15%" },
  colDiscount: { width: "15%" },
  colAmount: { width: "18%" },
  // Totals Section
  totalsContainer: {
    marginTop: 60,
    alignItems: "flex-end",
  },
  totalsSection: {
    width: 320,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 11,
  },
  totalsLabel: {
    fontSize: 20,
    fontWeight: 400,
    color: "#333333",
  },
  totalsValue: {
    fontSize: 20,
    color: "#000000",
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8E8E8",
    padding: 12,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 25,
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: 600,
    color: "#000000",
    textAlign: "right",
    width: 150,
  },
  // Terms Section
  termsSection: {
    marginTop: 80,
    marginBottom: 120,
  },
  termsTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: "#000000",
    marginBottom: 20,
  },
  termText: {
    fontSize: 18,
    fontWeight: 400,
    color: "#333333",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  // Footer
  footerNote: {
    fontSize: 15,
    fontWeight: 400,
    color: "#999999",
    textAlign: "center",
    letterSpacing: 5,
  },
});

// Company information
const companyInfo = {
  name: "Techyfy",
  address: "Muradpur, Chittagong 4211",
  phone: "01882771113",
};

// Terms and conditions
const termsAndConditions = [
  "1. The products under warranty (invoice, box, serial number, and warranty sticker must all be kept intact) will be repaired or replaced by the supplier.",
  "2. Time taken for the warranty process will be controlled by the supplier.",
  "3. The warranty will be followed as per the terms and conditions of the supplier.",
  "4. Techyfy offers a 7-day replacement warranty, provided that the product's invoice, box, serial number, and warranty sticker are all kept intact.",
];

interface InvoiceItem {
  slNo: number;
  itemName: string;
  quantity: number;
  rate: number;
  discountRow: number;
  amount: number;
}

interface InvoiceDocumentProps {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: InvoiceItem[];
  netTotal: number;
  discountNet: number;
  deliveryCharge: number;
  grandTotal: number;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceNumber,
  date,
  customerName,
  customerAddress,
  customerPhone,
  items,
  netTotal,
  discountNet,
  deliveryCharge,
  grandTotal,
}) => {
  const formatCurrency = (amount: number) => {
    return `৳ ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.invoiceTitle}>Invoice</Text>

        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Invoice No :</Text>
            <Text style={styles.invoiceValue}>{invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Date            :  </Text>
            <Text style={styles.invoiceValue}>{date}</Text>
          </View>
        </View>

        <View style={styles.billingContainer}>
          <View style={styles.billToSection}>
            <Text style={styles.billingTitle}>Bill to</Text>
            <Text style={styles.billingName}>{customerName}</Text>
            <Text style={styles.billingText}>{customerAddress}</Text>
            <Text style={styles.billingText}>{customerPhone}</Text>
          </View>

          <View style={styles.billerSection}>
            <Text style={styles.billingTitle}>Biller</Text>
            <Text style={styles.billingName}>{companyInfo.name}</Text>
            <Text style={styles.billingText}>{companyInfo.address}</Text>
            <Text style={styles.billingText}>{companyInfo.phone}</Text>
          </View>
        </View>

        <Text style={styles.descriptionLabel}>Description</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colSlNo]}>Sl No.</Text>
          <Text style={[styles.tableHeaderText, styles.colItemName]}>Item Name</Text>
          <Text style={[styles.tableHeaderText, styles.colQuantity]}>Quantity</Text>
          <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.colDiscount]}>Discount</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colSlNo]}>{item.slNo}</Text>
            <Text style={[styles.tableCell, styles.colItemName]}>{item.itemName}</Text>
            <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colRate]}>{formatCurrency(item.rate)}</Text>
            <Text style={[styles.tableCell, styles.colDiscount]}>{formatCurrency(item.discountRow)}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}

        <View style={styles.totalsContainer}>
          <View style={styles.totalsSection}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Net Total :</Text>
              <Text style={styles.totalsValue}>{formatCurrency(netTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount :</Text>
              <Text style={styles.totalsValue}>{formatCurrency(discountNet)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Delivery Charge :</Text>
              <Text style={styles.totalsValue}>{formatCurrency(deliveryCharge)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total :</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions :</Text>
          {termsAndConditions.map((term, index) => (
            <Text key={index} style={styles.termText}>
              {term}
            </Text>
          ))}
        </View>

        <Text style={styles.footerNote}>
          This is an automatically generated invoice and does not require an authorized signature.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
