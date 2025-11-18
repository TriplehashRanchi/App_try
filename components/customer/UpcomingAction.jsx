import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UpcomingAction({ investments }) {
  let due = null;

  investments.forEach((inv) => {
    if (inv.type === "rd" && inv.installments) {
      inv.installments.forEach((i) => {
        if (i.status === "due" && (!due || i.dueDate < due.dueDate)) {
          due = { ...i, investmentId: inv.id };
        }
      });
    }
  });

  if (!due) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Upcoming Payment</Text>
      <Text style={styles.text}>
        Your next RD installment of{" "}
        <Text style={styles.bold}>₹{due.amountExpected}</Text> is due on{" "}
        {new Date(due.dueDate).toDateString()}
      </Text>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 20,
    backgroundColor: "#eef4ff",
    padding: 18,
    borderRadius: 16,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  text: { color: "#444" },
  bold: { fontWeight: "700" },
  btn: {
    marginTop: 10,
    backgroundColor: "#1e6de8",
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: "white", textAlign: "center", fontWeight: "600" },
});
