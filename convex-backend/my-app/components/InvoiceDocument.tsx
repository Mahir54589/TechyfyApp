import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional, for better typography)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
});

// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 12,
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyInfo: {
    flexDirection: "column",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textDecoration: "underline",
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "12%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCol: {
    width: "12%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 10,
  },
  tableColWide: {
    width: "28%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 10,
  },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  totalsColumn: {
    width: "40%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalsLabel: {
    fontSize: 12,
  },
  totalsValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    paddingTop: 5,
    marginTop: 5,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
});

// Company information from environment variables
// In production, these are set in Vercel environment variables
const companyInfo = {
  name: process.env.COMPANY_NAME || "Your Company Name",
  address: process.env.COMPANY_ADDRESS || "Your Address, Dhaka, Bangladesh",
  email: process.env.COMPANY_EMAIL || "contact@yourcompany.com",
  phone: process.env.COMPANY_PHONE || "+880 1XXX XXXXXX",
  bin: process.env.COMPANY_BIN || "BIN: 123456789012",
  logoUrl: process.env.COMPANY_LOGO_URL,
  paymentDetails: {
    bKash: process.env.PAYMENT_BKASH || "017XXXXXXXX",
    nagad: process.env.PAYMENT_NAGAD || "017XXXXXXXX",
    bankAccount: process.env.PAYMENT_BANK || "Account Name: Your Company, Account Number: XXXXXXXX, Bank: XYZ Bank",
  },
  terms: process.env.INVOICE_TERMS,
};

interface InvoiceDocumentProps {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{
    productName: string;
    color: string;
    warranty: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceNumber,
  date,
  customerName,
  customerAddress,
  customerPhone,
  items,
  subtotal,
  taxRate,
  taxAmount,
  total,
}) => {
  // Format currency with BDT symbol
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-IN")}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
            <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetails}>{companyInfo.bin}</Text>
          </View>
        </View>

        {/* Invoice Title */}
        <Text style={styles.title}>INVOICE</Text>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <Text>Invoice Number: {invoiceNumber}</Text>
          <Text>Date: {formatDate(date)}</Text>
        </View>

        {/* Biller Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billed By:</Text>
          <Text>{companyInfo.name}</Text>
          <Text>{companyInfo.address}</Text>
          <Text>{companyInfo.bin}</Text>
          <Text>Phone: {companyInfo.phone}</Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billed To:</Text>
          <Text>{customerName}</Text>
          <Text>{customerAddress}</Text>
          <Text>Phone: {customerPhone}</Text>
        </View>

        {/* Products Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>S.No.</Text>
            <Text style={styles.tableColWide}>Product Name</Text>
            <Text style={styles.tableCol}>Unit</Text>
            <Text style={styles.tableCol}>Warranty</Text>
            <Text style={styles.tableCol}>Unit Price (৳)</Text>
            <Text style={styles.tableCol}>Amount (৳)</Text>
          </View>
          
          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol}>{index + 1}</Text>
              <Text style={styles.tableColWide}>{item.productName}</Text>
              <Text style={styles.tableCol}>{item.quantity}</Text>
              <Text style={styles.tableCol}>{item.warranty}</Text>
              <Text style={styles.tableCol}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.tableCol}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsColumn}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal:</Text>
              <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>VAT ({(taxRate * 100).toFixed(0)}%):</Text>
              <Text style={styles.totalsValue}>{formatCurrency(taxAmount)}</Text>
            </View>
            <View style={[styles.totalsRow, styles.grandTotal]}>
              <Text style={styles.totalsLabel}>Grand Total:</Text>
              <Text style={[styles.totalsValue, styles.grandTotalValue]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text>Payment Details:</Text>
          <Text>bKash: {companyInfo.paymentDetails.bKash}</Text>
          <Text>Nagad: {companyInfo.paymentDetails.nagad}</Text>
          <Text>{companyInfo.paymentDetails.bankAccount}</Text>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;