// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { supabase } from "../lib/supabase";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !confirmPass) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPass) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: "https://seu-projeto.com/login",
      },
    });

    if (error) {
      console.log("REGISTER ERROR:", error);
      Alert.alert("Erro", error.message);
      setLoading(false);
      return;
    }

    Alert.alert(
      "Verifique seu email",
      "Enviamos um link de confirmação. Confirme para poder acessar sua conta."
    );

    navigation.replace("Login");
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: null })}
    >
      <View style={styles.card}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo</Text>

        <View style={styles.form}>
          <FormInput
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
          />

          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
          />

          <FormInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <FormInput
            label="Confirmar senha"
            value={confirmPass}
            onChangeText={setConfirmPass}
            placeholder="••••••••"
            secureTextEntry
          />

          <PrimaryButton
            title={loading ? "Criando..." : "Criar conta"}
            onPress={handleRegister}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.link}
          >
            <Text style={styles.linkText}>Já tenho conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    elevation: 5,
  },
  logo: { width: 90, height: 90, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#212121" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  form: { width: "100%" },
  link: { marginTop: 14, alignSelf: "center" },
  linkText: { color: "#2E7D32", fontWeight: "600" },
});
