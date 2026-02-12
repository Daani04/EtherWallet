import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import theme from "../../styles/theme";

const COLORS = theme?.colors || theme?.COLORS || theme;

const API_KEY = "698b5155dbadb1.67947020"; 
const API_URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,finance&apikey=${API_KEY}`;

const menuNoticias = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNews(data.feed || []);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando menuNoticias:", error);
      setLoading(false);
    }
  };

  const getSentimentStyle = (score) => {
    if (score > 0.15) return { color: COLORS.primary, label: "Optimista" };
    if (score < -0.15) return { color: COLORS.danger, label: "Bajista" };
    return { color: COLORS.textMuted, label: "Neutral" };
  };

  return (
    <View style={common.safe}>
      <View style={[common.headerRow, { paddingTop: Platform.OS === "ios" ? 60 : 40 }]}>
        <Text style={common.headerTitle}>Geopolítica & Mercados</Text>
        <TouchableOpacity onPress={fetchNews}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={common.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={common.loadingText}>Analizando el mercado...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={common.scrollPadding}>
          {news.map((item, index) => {
            const sentiment = getSentimentStyle(item.overall_sentiment_score);
            return (
              <TouchableOpacity
                key={index}
                style={common.newsCard}
                onPress={() => Linking.openURL(item.url)}
              >
                {item.banner_image && (
                  <Image source={{ uri: item.banner_image }} style={common.newsImage} />
                )}
                
                <View style={common.newsCardContent}>
                  <View style={common.sentimentRow}>
                    <Text style={[common.sentimentLabel, { color: sentiment.color }]}>
                      {sentiment.label}
                    </Text>
                    <Text style={common.newsSource}>
                      {item.source} • {item.time_published.slice(0, 8)}
                    </Text>
                  </View>

                  <Text style={common.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  
                  <Text style={common.newsSummary} numberOfLines={3}>
                    {item.summary}
                  </Text>

                  <View style={common.topicContainer}>
                    {item.topics.slice(0, 2).map((t, i) => (
                      <View key={i} style={common.topicTag}>
                        <Text style={common.topicText}>{t.topic}</Text>
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

export default menuNoticias;
