import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

export default function HistoryScreen() {
  const navigation = useNavigation();

  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [produtoFiltro, setProdutoFiltro] = useState("Todos");

  const [produtos, setProdutos] = useState([]);

  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);

  // ===============================
  // CARREGA MOVIMENTAÇÕES
  // ===============================
  async function carregarMovimentacoes() {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) return;

      // movimentos + nome do produto
      const { data, error } = await supabase
        .from("movimentacoes")
        .select("*, produtos(nome)")
        .eq("user_id", user.id)
        .order("data_hora", { ascending: false });

      if (!error) setMovs(data);

      const { data: prods } = await supabase
        .from("produtos")
        .select("id, nome")
        .eq("user_id", user.id);

      setProdutos(prods || []);
    } catch (e) {
      console.log("ERRO HISTORICO:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => carregarMovimentacoes());
    return unsub;
  }, [navigation]);

  // ===============================
  // FILTRO (CORRIGIDO)
  // ===============================
  function aplicarFiltros() {
    return movs.filter((m) => {
      const tipoOK =
        tipoFiltro === "Todos" ||
        m.tipo.toLowerCase() === tipoFiltro.toLowerCase();

      const produtoOK =
        produtoFiltro === "Todos" || m.produtos?.nome === produtoFiltro;

      return tipoOK && produtoOK;
    });
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarMovimentacoes();
    setRefreshing(false);
  }, []);

  // ===============================
  // RENDER
  // ===============================
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* FILTROS */}
      <View style={styles.filterRow}>

        {/* FILTRO TIPO */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowTipoModal(true)}
        >
          <Text style={styles.filterLabel}>Tipo:</Text>
          <Text style={styles.filterValue}>{tipoFiltro} ▼</Text>
        </TouchableOpacity>

        {/* FILTRO PRODUTO */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowProdutoModal(true)}
        >
          <Text style={styles.filterLabel}>Produto:</Text>
          <Text style={styles.filterValue}>{produtoFiltro} ▼</Text>
        </TouchableOpacity>

      </View>

      {/* MODAL TIPO */}
      <Modal transparent visible={showTipoModal} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTipoModal(false)}
        >
          <View style={styles.modalBox}>
            {["Todos", "Entrada", "Saída"].map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.modalItem}
                onPress={() => {
                  setTipoFiltro(t);
                  setShowTipoModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL PRODUTO */}
      <Modal transparent visible={showProdutoModal} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowProdutoModal(false)}
        >
          <View style={styles.modalBox}>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setProdutoFiltro("Todos");
                setShowProdutoModal(false);
              }}
            >
              <Text style={styles.modalItemText}>Todos</Text>
            </TouchableOpacity>

            {produtos.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.modalItem}
                onPress={() => {
                  setProdutoFiltro(p.nome);
                  setShowProdutoModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{p.nome}</Text>
              </TouchableOpacity>
            ))}

          </View>
        </TouchableOpacity>
      </Modal>

      {/* LISTA */}
      {loading ? (
        <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 90 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {aplicarFiltros().map((mov) => (
            <View key={mov.id} style={styles.card}>

              <View style={styles.cardHeader}>
                <Text style={styles.productName}>
                  {mov.produtos?.nome || "Produto removido"}
                </Text>

                <Text
                  style={[
                    styles.movType,
                    mov.tipo === "entrada" ? styles.green : styles.red,
                  ]}
                >
                  {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                </Text>
              </View>

              <Text style={styles.movQty}>
                {mov.tipo === "entrada" ? "+" : "-"}{mov.quantidade}
              </Text>

              <Text style={styles.movDate}>
                {new Date(mov.data_hora).toLocaleString("pt-BR")}
              </Text>

            </View>
          ))}

          {aplicarFiltros().length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
              Nenhuma movimentação encontrada.
            </Text>
          )}

        </ScrollView>
      )}

    </View>
  );
}


// ===============================
// ESTILOS
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    height: 90,
    backgroundColor: "#1565C0",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  backButton: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "700",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 15,
  },

  filterButton: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "48%",
  },

  filterLabel: { color: "#777", fontSize: 14 },
  filterValue: { color: "#333", fontSize: 15, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalBox: {
    backgroundColor: "#FFF",
    width: "70%",
    borderRadius: 12,
    paddingVertical: 10,
  },

  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalItemText: { fontSize: 16, color: "#333" },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  productName: { fontSize: 16, fontWeight: "700", color: "#333" },

  movType: { fontSize: 15, fontWeight: "700" },
  green: { color: "#2E7D32" },
  red: { color: "#C62828" },

  movQty: { fontSize: 16, marginTop: 6, color: "#444", fontWeight: "600" },

  movDate: { fontSize: 13, marginTop: 6, color: "#777" },
});
