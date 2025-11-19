import { Text, View } from "react-native";

export default function RdTimeline({ investment }) {

  const generateTimeline = () => {
    const total = investment.rdPeriodMonths;

    console.log(investment)
    const paid = Number(investment.installmentsPaid || 0);

    const startDate = new Date(investment.activationDate);
    const items = [];

    for (let i = 1; i <= total; i++) {
      let d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);

      items.push({
        month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
        status: i <= paid ? "paid" : "upcoming"
      });
    }
    return items;
  };

  const timeline = generateTimeline();

  return (
    <View style={{ backgroundColor: "#fff", padding: 16 }}>

      <Text style={{
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 20,
        color: "#222"
      }}>
        Installment History
      </Text>

      {/* AUTO FLOW LIKE CRED */}
      <View style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 22, // spacing between circles horizontally
      }}>
        {timeline.map((item, index) => (
          <View
            key={index}
            style={{
              alignItems: "center",
              width: 50, // ❗ tiny width to make auto-flow rows of 6–7 items
            }}
          >
            {/* STATUS CIRCLE */}
            {item.status === "paid" ? (
              <View style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#22c55e",
              }} />
            ) : (
              <View style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 1.3,
                borderColor: "#cfcfcf",
              }} />
            )}

            {/* MONTH LABEL */}
            <Text style={{
              marginTop: 6,
              fontSize: 11,
              color: "#666",
              fontWeight: "500",
            }}>
              {item.month}
            </Text>
          </View>
        ))}
      </View>

      {/* LEGEND */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 20
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{
            width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e"
          }} />
          <Text style={{ fontSize: 12, color: "#444" }}>on time</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{
            width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: "#cfcfcf"
          }} />
          <Text style={{ fontSize: 12, color: "#444" }}>upcoming</Text>
        </View>
      </View>

    </View>
  );
}
