import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import getData from "../../services/services";


const COLORS = theme?.colors || theme?.COLORS || theme;

const API_KEY = "698b5155dbadb1.67947020"; 
const API_URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,finance&limit=15&apikey=${API_KEY}`;
const menuNoticias = () => {
  const { t } = useTranslation();
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
    if (score > 0.15) return { color: COLORS.primary, label: t("news.sentiment.optimistic") };
    if (score < -0.15) return { color: COLORS.danger, label: t("news.sentiment.bearish") };
    return { color: COLORS.textMuted, label: t("news.sentiment.neutral") };
  };

  const formatFecha = (str) => {
    // Transforma 20240520T1030 -> 20/05/2024
    return str.replace(/^(\d{4})(\d{2})(\d{2}).*/, '$3/$2/$1');
  };

  return (
    <View style={common.safe}>
      <View style={[common.headerRow, { paddingTop: Platform.OS === "ios" ? 60 : 40 }]}>
        <Text style={common.headerTitle}>{t("news.headerTitle")}</Text>

        <TouchableOpacity onPress={fetchNews}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={common.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={common.loadingText}>{t("news.loading")}</Text>
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
