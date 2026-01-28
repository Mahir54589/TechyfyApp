import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// Scaled down font sizes to fit A4 (react-pdf uses 72 DPI)
// Original .pen sizes were for 96 DPI, scaling factor ~0.75
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 50,
    paddingRight: 50,
  },
  // Invoice Title - scaled from 87 to 65
  invoiceTitle: {
    fontSize: 65,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 25,
  },
  // Invoice Info Section - scaled from 30 to 22
  invoiceInfo: {
    marginBottom: 20,
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  invoiceLabel: {
    fontSize: 22,
    fontWeight: "medium",
    color: "#333333",
    width: 130,
  },
  invoiceValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginLeft: 10,
  },
  // Billing Section - scaled from 28 to 21
  billingContainer: {
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 30,
  },
  billToSection: {
    width: "50%",
  },
  billerSection: {
    width: "50%",
  },
  billingTitle: {
    fontSize: 21,
    fontWeight: "medium",
    color: "#666666",
    marginBottom: 10,
  },
  billingName: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  billingText: {
    fontSize: 21,
    color: "#333333",
    marginBottom: 3,
  },
  // Description Label - scaled from 24 to 18
  descriptionLabel: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 10,
  },
  // Table Styles - scaled from 25 to 19
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    height: 45,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  tableHeaderText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    height: 32,
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  tableCell: {
    fontSize: 19,
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
    marginTop: 30,
    alignItems: "flex-end",
  },
  totalsSection: {
    width: 250,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalsLabel: {
    fontSize: 16,
    color: "#333333",
  },
  totalsValue: {
    fontSize: 16,
    color: "#000000",
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8E8E8",
    padding: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "right",
  },
  // Terms Section - scaled from 24/18 to 18/14
  termsSection: {
    marginTop: 40,
    marginBottom: 50,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
  },
  termText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  // Footer - scaled from 15 to 11
  footerNote: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
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
  // Use "Tk" instead of ৳ since Helvetica doesn't support Bengali characters
  const formatCurrency = (amount: number) => {
    return `Tk ${amount.toLocaleString("en-IN", {
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
            <Text style={styles.invoiceLabel}>Date :</Text>
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
