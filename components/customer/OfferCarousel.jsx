import { STATIC_BASE_URL } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, View } from "react-native";
import axiosAuth from "../../utils/axiosAuth";

const { width } = Dimensions.get("window");

export default function OffersCarousel() {
  const [offers, setOffers] = useState([]);
  const flatRef = useRef(null);
  const [index, setIndex] = useState(0);

  const BASE = STATIC_BASE_URL;

  useEffect(() => {
    axiosAuth
      .get("/offer-banners")
      .then((res) => setOffers(res.data || []))
      .catch(() => setOffers([]));
  }, []);

  // Auto scroll ONLY if more than 1 banner
  useEffect(() => {
    if (offers.length <= 1) return;

    const timer = setInterval(() => {
      const next = (index + 1) % offers.length;
      setIndex(next);

      flatRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [index, offers]);

  if (!offers.length) return null;

  return (
    <View style={{ marginVertical: 12 }}>
      <FlatList
        ref={flatRef}
        data={offers}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={offers.length > 1} // ✅ KEY FIX
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              width: width - 40,
              marginHorizontal: 20,
            }}
          >
            <Image
              source={{ uri: `${BASE}${item.imageUrl}` }}
              style={{
                width: "100%",
                height: 140,
                borderRadius: 14,
              }}
              resizeMode="cover"
            />
          </View>
        )}
      />
    </View>
  );
}
