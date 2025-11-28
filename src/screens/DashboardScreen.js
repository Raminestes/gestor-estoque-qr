import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// 👉 importa o supabase
import { supabase } from "../lib/supabase";

export default function DashboardScreen() {

  const navigation = useNavigation();

  // estado dos produtos
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================================
  // BUSCAR PRODUTOS DO SUPABASE
  // ================================
  async function carregarProdutos() {
    try {
      setLoading(true);

      // pega usuário logado
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      // busca produtos do usuário logado
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("ERRO AO BUSCAR PRODUTOS:", error);
        return;
      }

      setProdutos(data);

    } catch (err) {
      console.log("ERRO FATAL:", err);

    } finally {
      setLoading(false);
    }
  }

  // carrega ao abrir a tela
  useEffect(() => {
    carregarProdutos();
  }, []);

  // para puxar pra atualizar
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarProdutos();
    setRefreshing(false);
  }, []);

  // ================================
  // RENDER
  // ================================
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* LOADER */}
      {loading && (
        <View style={{ marginTop: 40 }}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      )}

      {/* CONTEÚDO */}
      {!loading && (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* CARDS */}
          <View style={styles.cardsRow}>
            
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Produtos</Text>
              <Text style={styles.cardNumber}>{produtos.length}</Text>
            </View>

            <View style={[styles.card, styles.cardDanger]}>
              <Text style={styles.cardLabel}>Estoque Baixo</Text>
              <Text style={styles.cardDangerNumber}>
                {produtos.filter(p => p.quantidade <= 5).length}
              </Text>
            </View>

          </View>

          {/* LISTA */}
          <Text style={styles.sectionTitle}>Produtos</Text>

          {produtos.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Text style={styles.productName}>{item.nome}</Text>
              <Text style={styles.productQty}>{item.quantidade} un</Text>
            </View>
          ))}

          {produtos.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
              Nenhum produto cadastrado ainda.
            </Text>
          )}

          <View style={{ height: 100 }} />

        </ScrollView>
      )}

      {/* BOTÃO FIXO */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddProduct")}
      >
        <Text style={styles.addButtonText}>Adicionar Produto</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    height: 90,
    backgroundColor: "#2E7D32",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 18,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 25,
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    elevation: 2,
  },

  cardLabel: {
    fontSize: 15,
    color: "#444",
    marginBottom: 5,
  },

  cardNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2E7D32",
  },

  cardDanger: {
    backgroundColor: "#ffebee",
    borderColor: "#ffcdd2",
  },

  cardDangerNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#D32F2F",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  productItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  productName: {
    fontSize: 15,
    color: "#333",
  },

  productQty: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
  },

  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
