import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Nav from "../../components/Nav";

import getData from "../../services/services"; 

const API_KEY = "698b5155dbadb1.67947020"; 
const API_URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,finance&limit=15&apikey=${API_KEY}`;
const menuNoticias = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

const fetchNews = async () => {
  setLoading(true);
  const data = await getData(API_URL, null); 
  
  if (data && data.feed) {
    setNews(data.feed);
  } else {
    console.log("Error de la API:", data); 
  }
  setLoading(false);
};

  const getSentimentStyle = (score) => {
    if (score > 0.15) return { color: "#2bee79", label: "Optimista" };
    if (score < -0.15) return { color: "#ff6b6b", label: "Bajista" };
    return { color: "#9db9a8", label: "Neutral" };
  };

  const formatFecha = (str) => {
    // Transforma 20240520T1030 -> 20/05/2024
    return str.replace(/^(\d{4})(\d{2})(\d{2}).*/, '$3/$2/$1');
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Geopolítica & Mercados</Text>
        <TouchableOpacity onPress={fetchNews}>
          <MaterialIcons name="refresh" size={24} color="#2bee79" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2bee79" />
          <Text style={styles.loadingText}>Analizando el mercado...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {news.map((item, index) => {
            const sentiment = getSentimentStyle(item.overall_sentiment_score);
            return (
              <TouchableOpacity
                key={index}
                style={styles.newsCard}
                onPress={() => Linking.openURL(item.url)}
              >
                {item.banner_image && (
                  <Image source={{ uri: item.banner_image }} style={styles.newsImage} />
                )}
                
                <View style={styles.cardContent}>
                  <View style={styles.sentimentRow}>
                    <Text style={[styles.sentimentLabel, { color: sentiment.color }]}>
                      {sentiment.label}
                    </Text>
                    <Text style={styles.newsSource}>
                        {item.source} • {formatFecha(item.time_published)}
                    </Text>
                  </View>

                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  
                  <Text style={styles.newsSummary} numberOfLines={3}>
                    {item.summary}
                  </Text>

                  <View style={styles.topicContainer}>
                    {item.topics.slice(0, 2).map((t, i) => (
                      <View key={i} style={styles.topicTag}>
                        <Text style={styles.topicText}>{t.topic}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <Nav />
    </View>
  );
};

const COLORS = {
  bg: "#102217",
  card: "#1c2720",
  text: "#ffffff",
  muted: "#9db9a8",
  primary: "#2bee79",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: COLORS.muted, marginTop: 10 },
  scrollContainer: { padding: 16 },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59,84,69,0.5)",
  },
  newsImage: { width: "100%", height: 180, resizeMode: "cover" },
  cardContent: { padding: 16 },
  sentimentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  sentimentLabel: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  newsSource: { color: COLORS.muted, fontSize: 12 },
  newsTitle: { color: COLORS.text, fontSize: 17, fontWeight: "700", marginBottom: 8 },
  newsSummary: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  topicContainer: { flexDirection: "row", marginTop: 12, gap: 8 },
  topicTag: { backgroundColor: "rgba(43,238,121,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  topicText: { color: COLORS.primary, fontSize: 10, fontWeight: "bold" },
});

export default menuNoticias;