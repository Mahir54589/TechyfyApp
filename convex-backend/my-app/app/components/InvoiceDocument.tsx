import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Inter font
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
  fontWeight: 400,
});
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
  fontWeight: 500,
});
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
  fontWeight: 600,
});
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
  fontWeight: 700,
});

// Define styles based on pencil design
const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 12,
    padding: 80,
    backgroundColor: "#FFFFFF",
  },
  spacer1: {
    height: 20,
  },
  invoiceTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#000000",
    marginBottom: 32,
  },
  invoiceInfo: {
    marginBottom: 32,
  },
  invoiceNoRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    gap: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: 400,
    color: "#333333",
    width: 100,
  },
  value: {
    fontSize: 13,
    fontWeight: 600,
    color: "#000000",
  },
  spacer2: {
    height: 30,
  },
  billingSection: {
    flexDirection: "row",
    gap: 80,
    marginBottom: 40,
  },
  billTo: {
    flex: 1,
  },
  biller: {
    flex: 1,
  },
  billingTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: "#666666",
    marginBottom: 10,
  },
  billingName: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000000",
    marginBottom: 5,
  },
  billingText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#333333",
    marginBottom: 2,
  },
  spacer3: {
    height: 40,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: 400,
    color: "#666666",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    paddingVertical: 10,
    paddingHorizontal: 24,
    gap: 20,
    alignItems: "center",
    height: 40,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 600,
    color: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 24,
    gap: 20,
    alignItems: "center",
    height: 40,
  },
  tableCell: {
    fontSize: 12,
    fontWeight: 400,
    color: "#333333",
  },
  slNoCol: {
    width: "8%",
  },
  itemNameCol: {
    width: "32%",
  },
  quantityCol: {
    width: "12%",
    textAlign: "center",
  },
  rateCol: {
    width: "15%",
    textAlign: "right",
  },
  discountCol: {
    width: "15%",
    textAlign: "right",
  },
  amountCol: {
    width: "18%",
    textAlign: "right",
  },
  spacer4: {
    height: 60,
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 80,
  },
  totalsSection: {
    width: 320,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalsLabel: {
    fontSize: 13,
    fontWeight: 400,
    color: "#333333",
  },
  totalsValue: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000000",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8E8E8",
    padding: 12,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000",
  },
  termsSection: {
    marginBottom: 120,
  },
  termsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#000000",
    marginBottom: 16,
  },
  termText: {
    fontSize: 11,
    fontWeight: 400,
    color: "#333333",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 10,
    fontWeight: 400,
    color: "#999999",
    textAlign: "center",
  },
});

// Company information - hardcoded for Techyfy
const companyInfo = {
  name: "Techyfy",
  address: "Jane Alam Devnas Road",
  city: "Chittagong",
  phone: "01306277555",
};

// Terms and conditions - hardcoded
const termsAndConditions = [
  "1. Products under warranty will be repaired or replaced by the supplier, provided the product's invoice, box, serial number, and warranty sticker are all kept intact.",
  "2. The warranty will be followed as per the terms and conditions of the supplier.",
  "3. Techyfy offers a 7-day replacement warranty, provided that the product's invoice, box, serial number, and warranty sticker are all kept intact.",
  "4. For further information, please visit https://techyfy.shop/terms_&_conditions",
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
  // Format currency with BDT symbol
  const formatCurrency = (amount: number) => {
    return `৳ ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format discount number
  const formatDiscount = (discount: number) => {
    return discount.toFixed(2);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Spacer */}
        <View style={styles.spacer1} />

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>Invoice</Text>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceNoRow}>
            <Text style={styles.label}>Invoice No :</Text>
            <Text style={styles.value}>{invoiceNumber}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.label}>Date :</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer2} />

        {/* Billing Section */}
        <View style={styles.billingSection}>
          {/* Bill To */}
          <View style={styles.billTo}>
            <Text style={styles.billingTitle}>Bill to</Text>
            <Text style={styles.billingName}>{customerName}</Text>
            <Text style={styles.billingText}>{customerAddress}</Text>
            <Text style={styles.billingText}>{customerPhone}</Text>
          </View>

          {/* Biller */}
          <View style={styles.biller}>
            <Text style={styles.billingTitle}>Biller</Text>
            <Text style={styles.billingName}>{companyInfo.name}</Text>
            <Text style={styles.billingText}>{companyInfo.address}</Text>
            <Text style={styles.billingText}>{companyInfo.city}</Text>
            <Text style={styles.billingText}>{companyInfo.phone}</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer3} />

        {/* Description Label */}
        <Text style={styles.descriptionLabel}>Description</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.slNoCol]}>Sl No.</Text>
          <Text style={[styles.tableHeaderText, styles.itemNameCol]}>Item Name</Text>
          <Text style={[styles.tableHeaderText, styles.quantityCol]}>Quantity</Text>
          <Text style={[styles.tableHeaderText, styles.rateCol]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.discountCol]}>Discount</Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
        </View>

        {/* Table Rows */}
        {items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.slNoCol]}>{item.slNo}</Text>
            <Text style={[styles.tableCell, styles.itemNameCol]}>{item.itemName}</Text>
            <Text style={[styles.tableCell, styles.quantityCol]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.rateCol]}>{formatCurrency(item.rate)}</Text>
            <Text style={[styles.tableCell, styles.discountCol]}>{formatDiscount(item.discountRow)}</Text>
            <Text style={[styles.tableCell, styles.amountCol]}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}

        {/* Spacer */}
        <View style={styles.spacer4} />

        {/* Totals Section */}
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

        {/* Terms & Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions :</Text>
          {termsAndConditions.map((term, index) => (
            <Text key={index} style={styles.termText}>
              {term}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footerNote}>
          This is an automatically generated invoice and does not require an authorized signature.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
