import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { FloatingAction } from "react-native-floating-action";

// ÍCONES VETORIAIS PROFISSIONAIS
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function DashboardScreen() {

  const navigation = useNavigation();

  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [ordenarPor, setOrdenarPor] = useState("Data");
  const [showDropdown, setShowDropdown] = useState(false);

  async function carregarProdutos() {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setProdutos([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("produtos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProdutos(data || []);
      filtrarBuscaEOrdenar(data || [], search, ordenarPor);

    } catch (err) {
      console.log("ERRO:", err);
    } finally {
      setLoading(false);
    }
  }

  function filtrarBuscaEOrdenar(lista, termo, ordem) {
    let novaLista = [...lista];

    if (termo.trim() !== "") {
      const t = termo.toLowerCase();
      novaLista = novaLista.filter((p) =>
        p.nome.toLowerCase().includes(t)
      );
    }

    if (ordem === "Quantidade") {
      novaLista.sort((a, b) => b.quantidade - a.quantidade);
    } else if (ordem === "Preço") {
      novaLista.sort(
        (a, b) =>
          (b.preco ? Number(b.preco) : 0) -
          (a.preco ? Number(a.preco) : 0)
      );
    } else {
      novaLista.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    setProdutosFiltrados(novaLista);
  }

  useEffect(() => {
    filtrarBuscaEOrdenar(produtos, search, ordenarPor);
  }, [search, ordenarPor]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () =>
      carregarProdutos()
    );
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarProdutos();
    setRefreshing(false);
  }, []);

  async function excluirProduto(id) {
    Alert.alert(
      "Excluir produto",
      "Tem certeza que deseja excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await supabase.from("produtos").delete().eq("id", id);
            carregarProdutos();
          }
        }
      ]
    );
  }

  // ---------------------------
  // MENU FLUTUANTE DEFINITIVO
  // ---------------------------
  const actions = [
    {
      text: "Adicionar Produto",
      icon: <MaterialCommunityIcons name="plus-box" size={28} color="#FFF" />,
      name: "add_product",
      position: 1,
      color: "#2E7D32",
    },
    {
      text: "Gerar QR Code",
      icon: <MaterialCommunityIcons name="qrcode" size={26} color="#FFF" />,
      name: "generate_qr",
      position: 2,
      color: "#424242",
    },
    {
      text: "Escanear QR",
      icon: <MaterialCommunityIcons name="camera-outline" size={28} color="#FFF" />,
      name: "scan_qr",
      position: 3,
      color: "#1565C0",
    },
    {
      text: "Histórico",
      icon: <MaterialIcons name="history" size={28} color="#FFF" />,
      name: "history",
      position: 4,
      color: "#6A1B9A",
    },
  ];

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* BUSCA */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar produto..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* DROPDOWN */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={styles.dropdownLabel}>Ordenar por:</Text>
        <Text style={styles.dropdownValue}>{ordenarPor} ▼</Text>
      </TouchableOpacity>

      {/* MODAL ORDENAR */}
      <Modal transparent visible={showDropdown} animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownBox}>
            {["Data", "Quantidade", "Preço"].map(op => (
              <TouchableOpacity 
                key={op}
                style={styles.dropdownItem}
                onPress={() => {
                  setOrdenarPor(op);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LISTA DE PRODUTOS */}
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          <Text style={styles.sectionTitle}>Produtos</Text>

          {produtosFiltrados.map((item) => (
            <View
              key={item.id}
              style={[
                styles.productItem,
                item.quantidade <= 5 && styles.lowStockCard,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.nome}</Text>

                {item.quantidade <= 5 && (
                  <Text style={styles.stockWarning}>⚠️ ESTOQUE BAIXO</Text>
                )}

                <Text style={styles.productQty}>{item.quantidade} un</Text>

                {item.preco !== null && (
                  <Text style={styles.productPrice}>
                    R$ {Number(item.preco).toFixed(2).replace(".", ",")}
                  </Text>
                )}
              </View>

              {/* BOTÕES */}
              <View style={styles.actionButtons}>

                <TouchableOpacity
                  style={styles.entryButton}
                  onPress={() =>
                    navigation.navigate("Movement", {
                      tipo: "entrada",
                      produtoId: item.id,
                    })
                  }
                >
                  <Text style={styles.entryButtonText}>Entrada</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exitButton}
                  onPress={() =>
                    navigation.navigate("Movement", {
                      tipo: "saida",
                      produtoId: item.id,
                    })
                  }
                >
                  <Text style={styles.exitButtonText}>Saída</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("EditProduct", {
                      productId: item.id,
                    })
                  }
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => excluirProduto(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>

              </View>
            </View>
          ))}

          {produtosFiltrados.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
              Nenhum produto encontrado.
            </Text>
          )}

        </ScrollView>
      )}

      {/* FLOATING MENU */}
      <FloatingAction
        actions={actions}
        color="#2E7D32"
        floatingIcon={<MaterialCommunityIcons name="menu" size={30} color="#FFF" />}
        onPressItem={(name) => {
          if (name === "add_product") navigation.navigate("AddProduct");
          if (name === "generate_qr") navigation.navigate("GenerateQR");
          if (name === "scan_qr") navigation.navigate("QRScanner");
          if (name === "history") navigation.navigate("History");
        }}
      />

    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    height: 90,
    backgroundColor: "#2E7D32",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#fff" },

  searchContainer: { paddingHorizontal: 20, marginTop: 12 },

  searchInput: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DDD",
    color: "#333",
  },

  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  dropdownLabel: { color: "#666", fontSize: 15 },
  dropdownValue: { color: "#333", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dropdownBox: {
    backgroundColor: "#FFF",
    width: "70%",
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 10,
  },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownItemText: { fontSize: 16, color: "#333" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  productItem: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  lowStockCard: {
    borderColor: "#FF8080",
    backgroundColor: "#FFE5E5",
  },

  productName: { fontSize: 16, fontWeight: "700", color: "#333" },
  stockWarning: { color: "#B71C1C", fontWeight: "700", marginTop: 2 },
  productQty: { fontSize: 14, color: "#2E7D32", marginTop: 4 },
  productPrice: { fontSize: 14, color: "#444", marginTop: 4 },

  actionButtons: { justifyContent: "center", gap: 6 },

  entryButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  entryButtonText: { color: "#FFF", fontWeight: "700" },

  exitButton: {
    backgroundColor: "#C62828",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exitButtonText: { color: "#FFF", fontWeight: "700" },

  editButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: { color: "#FFF", fontWeight: "700" },

  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: { color: "#FFF", fontWeight: "700" },
});
