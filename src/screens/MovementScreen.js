import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function MovementScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { produtoId, tipo } = route.params; 
  // tipo = "entrada" ou "saida"

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ----------------------------------------
  // CARREGA DADOS DO PRODUTO
  // ----------------------------------------
  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", produtoId)
        .single();

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar o produto.");
        navigation.goBack();
        return;
      }

      setProduto(data);
      setLoading(false);
    }

    loadProduct();
  }, []);

  // ----------------------------------------
  // CONFIRMAR MOVIMENTAÇÃO
  // ----------------------------------------
  async function handleSubmit() {
  if (saving) return;

  const q = Number(quantidade);

  if (!q || q <= 0) {
    Alert.alert("Erro", "Informe uma quantidade válida.");
    return;
  }

  setSaving(true);

  // 🔥 PEGAR SESSÃO ATUAL
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    setSaving(false);
    Alert.alert("Erro", "Usuário não autenticado!");
    return;
  }

  console.log("UID LOGADO: ", user.id);

  // 🔥 CHAMA A FUNÇÃO RPC
  const { data, error } = await supabase.rpc("registrar_movimentacao", {
    p_produto_id: Number(produtoId),
    p_tipo: tipo,
    p_quantidade: q
  });

  if (error) {
    setSaving(false);
    Alert.alert("Erro", error.message);
    return;
  }

  const novoEstoque = data?.[0]?.novo_estoque;

  Alert.alert(
    "Sucesso",
    `Movimentação registrada!\nNovo estoque: ${novoEstoque}`
  );

  navigation.navigate("Dashboard", { refresh: true });
}


  // ----------------------------------------
  // LOADING INICIAL
  // ----------------------------------------
  if (loading || !produto) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Produto</Text>
        <Text style={styles.produtoNome}>{produto.nome}</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>Estoque Atual</Text>
        <Text style={styles.estoqueAtual}>{produto.quantidade} unidades</Text>
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            Confirmar {tipo === "entrada" ? "Entrada" : "Saída"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#F4F4F4",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },

  produtoNome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  estoqueAtual: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    fontSize: 16,
  },

  button: {
    marginTop: 22,
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 14,
    alignItems: "center",
  },

  cancelText: {
    color: "#D32F2F",
    fontSize: 15,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
