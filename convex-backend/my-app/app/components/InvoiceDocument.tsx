import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 15,
  },
  invoiceInfo: {
    marginBottom: 15,
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  invoiceLabel: {
    fontSize: 11,
    color: "#333333",
    width: 80,
  },
  invoiceValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
  },
  billingContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 25,
  },
  billToSection: {
    width: "50%",
    paddingRight: 30,
  },
  billerSection: {
    width: "50%",
    paddingLeft: 30,
  },
  billingTitle: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 8,
  },
  billingName: {
    fontSize: 11,
    color: "#000000",
    marginBottom: 3,
  },
  billingText: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 2,
  },
  descriptionLabel: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    height: 28,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    height: 22,
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  tableCell: {
    fontSize: 9,
    color: "#333333",
    textAlign: "center",
  },
  // Column widths - adjusted for alignment
  colSlNo: { width: "8%" },
  colItemName: { width: "32%", textAlign: "left" },
  colQuantity: { width: "12%" },
  colRate: { width: "16%", textAlign: "right" },
  colDiscount: { width: "16%", textAlign: "right" },
  colAmount: { width: "16%", textAlign: "right" },
  // Totals Section - aligned with table amount column
  totalsContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  // Extended width to align with table
  totalsSection: {
    width: "36%", // Aligns with rate+discount+amount columns
    paddingRight: 10, // Match table padding
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#333333",
  },
  totalsValue: {
    fontSize: 9,
    color: "#000000",
    textAlign: "right",
  },
  // Grand total row with extended background
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8E8E8",
    paddingVertical: 6,
    paddingHorizontal: 10, // Extended to match table padding
    marginTop: 4,
    marginLeft: -10, // Extend left
    marginRight: -10, // Extend right
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "right",
  },
  termsSection: {
    marginTop: 25,
    marginBottom: 30,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  termText: {
    fontSize: 8,
    color: "#333333",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 7,
    color: "#999999",
    textAlign: "center",
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
  },
});

const companyInfo = {
  name: "Techyfy",
  address: "Muradpur, Chittagong 4211",
  phone: "01882771113",
};

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
  // Format number without Tk prefix for table cells
  const formatNumber = (amount: number) => {
    return `${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format with Tk suffix for display
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Tk`;
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
          <Text style={[styles.tableHeaderText, styles.colRate]}>Unit</Text>
          <Text style={[styles.tableHeaderText, styles.colDiscount]}>Discount</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colSlNo]}>{item.slNo}</Text>
            <Text style={[styles.tableCell, styles.colItemName]}>{item.itemName}</Text>
            <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colRate]}>{formatNumber(item.rate)}</Text>
            <Text style={[styles.tableCell, styles.colDiscount]}>{formatNumber(item.discountRow)}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>{formatNumber(item.amount)}</Text>
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
