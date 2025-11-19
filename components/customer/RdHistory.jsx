import { StyleSheet, Text, View } from "react-native";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RDHistory({ investment }) {
  const installments = investment.installments || [];

  const monthlyInstallment = investment.principalAmount;

  const paidCount = installments.filter(i => i.status === "paid").length;

  const totalDeposited = paidCount * monthlyInstallment;

  const monthlyRate = 0.02; // 2% monthly

  const interestEarned = totalDeposited * monthlyRate * paidCount;

  const maturityValue = totalDeposited + interestEarned;

  const maturityDate = new Date(
    new Date(investment.activationDate).setMonth(
      new Date(investment.activationDate).getMonth() + investment.rdPeriodMonths
    )
  ).toDateString();

  const timelineDots = installments.map(inst => ({
    id: inst.id,
    paid: inst.status === "paid",
    monthName: months[new Date(inst.dueDate).getMonth()]
  }));

  return (
    <View style={styles.section}>
      
      {/* TOP ROW: Monthly Installment */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Monthly Installment</Text>
        <Text style={styles.amount}>₹{monthlyInstallment.toLocaleString("en-IN")}</Text>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>Installment History</Text>

      {/* DOTS – 4 per row, minimal, sleek */}
      <View style={styles.dotContainer}>
        {timelineDots.map((item) => (
          <View key={item.id} style={styles.dotWrapper}>
            <View
              style={[
                styles.dot,
                item.paid ? styles.dotPaid : styles.dotUpcoming
              ]}
            />
            <Text style={styles.dotLabel}>{item.monthName.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      {/* LEGEND */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
          <Text style={styles.legendText}>on time</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#d1d5db" }]} />
          <Text style={styles.legendText}>upcoming</Text>
        </View>
      </View>

      {/* SUMMARY LIKE OLD UI */}
      <View style={{ marginTop: 16 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.smallLabel}>Installments Paid</Text>
          <Text style={styles.smallValue}>{paidCount} / {installments.length}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.smallLabel}>Total Deposited</Text>
          <Text style={styles.smallValue}>₹{totalDeposited.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.smallLabel}>Interest Earned</Text>
          <Text style={[styles.smallValue, { color: "#16a34a" }]}>
            ₹{interestEarned.toFixed(2).toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.smallLabel}>Maturity Value</Text>
          <Text style={[styles.smallValue, { color: "#2563eb" }]}>
            ₹{maturityValue.toFixed(2).toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.smallLabel}>Maturity Date</Text>
          <Text style={styles.smallValue}>{maturityDate}</Text>
        </View>
      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 12,
    color: "#111",
  },

  label: { fontSize: 14, color: "#555" },
  amount: { fontSize: 15, fontWeight: "700", color: "#111" },

  dotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  dotWrapper: {
    width: "22%", // ensures 4 per row
    alignItems: "center",
    marginVertical: 8,
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,
    borderWidth: 1.8,
  },

  dotPaid: { borderColor: "#22c55e", backgroundColor: "#22c55e" },
  dotUpcoming: { borderColor: "#d1d5db", backgroundColor: "#fff" },

  dotLabel: {
    fontSize: 11,
    marginTop: 4,
    color: "#444",
  },

  legendRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 6,
  },

  legendText: { fontSize: 12, color: "#666" },

  smallLabel: { fontSize: 13, color: "#666" },
  smallValue: { fontSize: 13, fontWeight: "600", color: "#111" },
});
