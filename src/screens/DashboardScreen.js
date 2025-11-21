import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";

export default function DashboardScreen({ navigation }) {
  const [produtos, setProdutos] = useState([
    { id: "1", nome: "Tênis Nike Air", quantidade: 12 },
    { id: "2", nome: "Camiseta DryFit", quantidade: 8 },
    { id: "3", nome: "Calça Moletom", quantidade: 22 },
  ]);

  const totalProdutos = produtos.length;
  const emBaixa = produtos.filter((p) => p.quantidade < 10).length;

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemNome}>{item.nome}</Text>
      <Text style={styles.itemQtd}>{item.quantidade} un</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Cards resumo */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Produtos</Text>
          <Text style={styles.cardValue}>{totalProdutos}</Text>
        </View>

        <View style={[styles.card, { borderColor: "#D32F2F" }]}>
          <Text style={styles.cardLabel}>Em baixa</Text>
          <Text style={[styles.cardValue, { color: "#D32F2F" }]}>
            {emBaixa}
          </Text>
        </View>
      </View>

      {/* Título lista */}
      <Text style={styles.listTitle}>Produtos</Text>

      {/* Lista */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Botão adicionar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.addButtonText}>Adicionar Produto</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    width: "100%",
    height: 120,
    backgroundColor: "#2E7D32",
    justifyContent: "flex-end",
    paddingBottom: 20,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 20,
    alignItems: "center",
  },

  cardLabel: {
    fontSize: 14,
    color: "#555",
  },

  cardValue: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
    color: "#2E7D32",
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 30,
    marginLeft: 20,
    color: "#333",
  },

  itemCard: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    padding: 18,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemNome: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },

  itemQtd: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  addButton: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: "#2E7D32",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
