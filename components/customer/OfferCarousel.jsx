import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Text, View } from "react-native";
import axiosAuth, { API_BASE_URL } from "../../utils/axiosAuth";

const { width } = Dimensions.get("window");


export default function OffersCarousel() {
    const [offers, setOffers] = useState([]);
    const flatRef = useRef(null);
    const [index, setIndex] = useState(0);

    const BASE = API_BASE_URL.replace("/api", ""); // remove /api ONLY for images

    useEffect(() => {
        // console.log("📡 Fetching /offer-banners ...");

        axiosAuth
            .get("/offer-banners")
            .then((res) => {
                // console.log("✅ Response from /offer-banners:", res.data);
                setOffers(res.data || []);
            })
            .catch((err) => {
                console.log("❌ ERROR fetching /offer-banners:", err.message);
                setOffers([]);
            });
    }, []);

    // Auto scroll debug
    useEffect(() => {
        // console.log("🔁 Offers array updated:", offers);
        // console.log("➡️ Auto scroll enabled?", offers.length > 1);

        if (offers.length > 1) {
            const timer = setInterval(() => {
                let nextIndex = (index + 1) % offers.length;
                // console.log("➡️ Scrolling to index:", nextIndex);

                setIndex(nextIndex);

                if (flatRef.current) {
                    flatRef.current.scrollToIndex({ index: nextIndex, animated: true });
                } else {
                    console.log("⚠️ flatRef is NULL");
                }
            }, 3000);

            return () => clearInterval(timer);
        }
    }, [index, offers]);

    if (!offers.length) {
        console.log("⚠️ No offers found");
        return (
            <View style={{ padding: 10 }}>
                <Text style={{ textAlign: "center", color: "#6B7280" }}>
                    No active offers
                </Text>
            </View>
        );
    }

    return (
        <View style={{ marginVertical: 5 }}>
            <FlatList
                ref={flatRef}
                data={offers}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {

                    return (
                        <Image
                            source={{ uri: BASE + item.imageUrl }}
                            style={{
                                width: width - 40,
                                height: 100,
                                borderRadius: 20,
                                marginHorizontal: 10,
                                resizeMode: "contain",
                                backgroundColor: "#eee",
                            }}
                        />

                    );
                }}
                keyExtractor={(item, i) => i.toString()}
            />
        </View>
    );
}
