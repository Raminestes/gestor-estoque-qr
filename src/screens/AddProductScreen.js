import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";

import { supabase } from "../lib/supabase";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";

export default function AddProductScreen() {
  const navigation = useNavigation();

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!nome || !quantidade) {
      Alert.alert("Erro", "Preencha nome e quantidade!");
      return;
    }

    if (Number(quantidade) < 0) {
      Alert.alert("Erro", "A quantidade não pode ser negativa.");
      return;
    }

    setLoading(true);

    // PEGAR USUÁRIO LOGADO
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      Alert.alert("Erro", "Falha ao obter usuário.");
      setLoading(false);
      return;
    }

    const user = session?.user;

    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      setLoading(false);
      return;
    }

    // 🔥 CONVERTER PREÇO COM VÍRGULA PARA PONTO
    const precoFinal = preco
      ? Number(preco.replace(",", "."))
      : null;

    // SALVAR
    const { error } = await supabase.from("produtos").insert([
      {
        user_id: user.id,
        nome,
        quantidade: Number(quantidade),
        preco: precoFinal,
      },
    ]);

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      setLoading(false);
      return;
    }

    Alert.alert("Sucesso!", "Produto cadastrado.");
    setLoading(false);

    // AGORA VOLTA PARA O DASHBOARD E FORÇA O REFRESH
    navigation.navigate("Dashboard", { refresh: true });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: null })}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Adicionar Produto</Text>
        <Text style={styles.subtitle}>Preencha as informações abaixo</Text>

        <FormInput
          label="Nome do Produto"
          placeholder="Ex: Camiseta Dry Fit"
          value={nome}
          onChangeText={setNome}
        />

        <FormInput
          label="Quantidade"
          placeholder="Ex: 20"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />

        <FormInput
          label="Preço"
          placeholder="Ex: 59,90"
          value={preco}
          onChangeText={(val) => setPreco(val.replace(".", ","))}
          keyboardType="numeric"
        />

        <PrimaryButton
          title={loading ? "Salvando..." : "Salvar Produto"}
          onPress={handleSave}
          disabled={loading}
        />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 22,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 24,
  },
  cancelButton: {
    marginTop: 18,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D32F2F",
  },
});
