import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
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
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar o produto.");
        return;
      }

      setNome(data.nome);
      setQuantidade(String(data.quantidade));
      setPreco(String(data.preco || ""));
    }

    loadProduct();
  }, []);


  async function handleSave() {
    if (!nome || !quantidade) {
      Alert.alert("Erro", "Preencha nome e quantidade.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("produtos")
      .update({
        nome,
        quantidade: Number(quantidade),
        preco: preco ? Number(preco) : null,
      })
      .eq("id", productId);

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
      return;
    }

    Alert.alert("Sucesso", "Produto atualizado!");
    navigation.goBack();
  }

  
  async function handleDelete() {
    Alert.alert(
      "Excluir Produto",
      "Tem certeza que deseja excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("produtos")
              .delete()
              .eq("id", productId);

            if (error) {
              Alert.alert("Erro", "Não foi possível excluir o produto.");
              return;
            }

            Alert.alert("Removido", "Produto excluído.");
            navigation.goBack();
          },
        },
      ]
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
          onChangeText={setPreco}
          keyboardType="numeric"
          placeholder="Ex: 59.90"
        />

        <PrimaryButton
          title={loading ? "Salvando..." : "Salvar Alterações"}
          onPress={handleSave}
          disabled={loading}
        />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Excluir Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingTop: 30,
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
