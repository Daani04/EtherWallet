import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import theme from "../../styles/theme";
import getData from "../../services/services";
import { useSettings } from "../../context/SettingsContext";

const COLORS = theme?.colors || theme?.COLORS || theme;

const API_KEY = "698b5155dbadb1.67947020";
const API_URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,finance&limit=15&apikey=${API_KEY}`;

const menuNoticias = () => {
  const { t } = useTranslation();
  const { C } = useSettings();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (score > 0.15) return { color: C.primary, label: t("news.sentiment.optimistic") };
    if (score < -0.15) return { color: C.danger, label: t("news.sentiment.bearish") };
    return { color: C.textMuted, label: t("news.sentiment.neutral") };
  };

  return (
    <View style={[common.safe, { backgroundColor: C.bg }]}>
      <View style={[common.headerRow, { paddingTop: Platform.OS === "ios" ? 60 : 40 }]}>
        <Text style={[common.headerTitle, { color: C.textMain }]}>{t("news.headerTitle")}</Text>

        <TouchableOpacity onPress={fetchNews} activeOpacity={0.85}>
          <MaterialIcons name="refresh" size={24} color={C.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={common.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[common.loadingText, { color: C.textMuted }]}>{t("news.loading")}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={common.scrollPadding} style={{ backgroundColor: C.bg }}>
          {news.map((item, index) => {
            const sentiment = getSentimentStyle(item.overall_sentiment_score);
            return (
              <TouchableOpacity
                key={index}
                style={[common.newsCard, styles.newsCard]}
                onPress={() => Linking.openURL(item.url)}
                activeOpacity={0.9}
              >
                {item.banner_image && (
                  <Image source={{ uri: item.banner_image }} style={common.newsImage} />
                )}

                <View style={common.newsCardContent}>
                  <View style={common.sentimentRow}>
                    <Text style={[common.sentimentLabel, { color: sentiment.color }]}>
                      {sentiment.label}
                    </Text>
                    <Text style={[common.newsSource, { color: C.textMuted }]}>
                      {item.source} • {item.time_published.slice(0, 8)}
                    </Text>
                  </View>

                  <Text style={[common.newsTitle, { color: C.textMain }]} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <Text style={[common.newsSummary, { color: C.textMuted }]} numberOfLines={3}>
                    {item.summary}
                  </Text>

                  <View style={common.topicContainer}>
                    {item.topics.slice(0, 2).map((tt, i) => (
                      <View key={i} style={[common.topicTag, styles.topicTag]}>
                        <Text style={[common.topicText, { color: C.textMain }]}>{tt.topic}</Text>
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

const makeStyles = (C) =>
  StyleSheet.create({
    newsCard: {
      backgroundColor: C.cardBg,
      borderColor: C.border,
      borderWidth: 1,
      shadowColor: C.shadow,
      shadowOpacity: C.isDark ? 0.08 : 0.10,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 2,
    },
    topicTag: {
      backgroundColor: C.isDark ? "rgba(43,238,121,0.10)" : "rgba(43,238,121,0.14)",
      borderWidth: 1,
      borderColor: C.isDark ? "rgba(43,238,121,0.22)" : "rgba(43,238,121,0.28)",
    },
  });

export default menuNoticias;
