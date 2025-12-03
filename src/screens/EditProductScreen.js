import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

export default function EditProductScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { productId } = route.params;

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ================================
  // CARREGAR PRODUTO
  // ================================
  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar o produto.");
        setLoading(false);
        return;
      }

      setNome(data.nome || "");
      setQuantidade(String(data.quantidade || "0"));

      // 🔥 PREPARA O PREÇO PARA MOSTRAR NO INPUT (com vírgula)
      setPreco(
        data.preco != null
          ? String(data.preco).replace(".", ",")
          : ""
      );

      setLoading(false);
    }

    loadProduct();
  }, []);

  // ================================
  // SALVAR ALTERAÇÕES
  // ================================
  async function handleSave() {
    if (saving || deleting) return;

    if (!nome.trim()) {
      Alert.alert("Erro", "Preencha o nome do produto.");
      return;
    }

    if (Number(quantidade) < 0) {
      Alert.alert("Erro", "A quantidade não pode ser negativa.");
      return;
    }

    // 🔥 PREPARA O PREÇO PARA O BANCO (vírgula → ponto)
    const precoFinal = preco
      ? Number(preco.replace(",", "."))
      : null;

    if (precoFinal < 0) {
      Alert.alert("Erro", "O preço não pode ser negativo.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("produtos")
      .update({
        nome,
        quantidade: Number(quantidade),
        preco: precoFinal,
      })
      .eq("id", productId);

    setSaving(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
      return;
    }

    Alert.alert("Sucesso", "Produto atualizado!");

    // VOLTA PARA DASHBOARD E RECARREGA
    navigation.navigate("Dashboard", { refresh: true });
  }

  // ================================
  // EXCLUIR PRODUTO
  // ================================
  async function executeDelete() {
    setDeleting(true);

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", productId);

    setDeleting(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível excluir o produto.");
      return;
    }

    Alert.alert("Removido", "Produto excluído.");
    navigation.navigate("Dashboard", { refresh: true });
  }

  function handleDelete() {
    if (saving || deleting) return;

    Alert.alert(
      "Excluir Produto",
      "Tem certeza que deseja excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: executeDelete },
      ]
    );
  }

  // ================================
  // LOADING INICIAL
  // ================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: null })}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.title}>Editar Produto</Text>
        <Text style={styles.subtitle}>Atualize as informações abaixo</Text>

        <FormInput
          label="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Camiseta"
        />

        <FormInput
          label="Quantidade"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
          placeholder="Ex: 10"
        />

        <FormInput
          label="Preço"
          value={preco}
          onChangeText={(val) => setPreco(val.replace(".", ","))}
          keyboardType="numeric"
          placeholder="Ex: 59,90"
        />

        <PrimaryButton
          title={saving ? "Salvando..." : "Salvar Alterações"}
          onPress={handleSave}
          disabled={saving || deleting}
        />

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={saving || deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? "Excluindo..." : "Excluir Produto"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


// ================================
// ESTILOS
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#212121",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 20,
  },
  deleteButton: {
    marginTop: 20,
    alignItems: "center",
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D32F2F",
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
  },
});
