// src/screens/LoginScreen.js
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("LOGIN ERROR:", error);

      if (error.message.includes("Invalid login credentials")) {
        Alert.alert("Erro", "Email ou senha inválidos.");
      } else if (error.message.includes("Email not confirmed")) {
        Alert.alert("Confirmação necessária", "Confirme seu email antes de entrar.");
      } else {
        Alert.alert("Erro", error.message);
      }

      setLoading(false);
      return;
    }

    navigation.replace("Dashboard");
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

        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Entre para continuar</Text>

        <View style={styles.form}>
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
          />

          <FormInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <PrimaryButton
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.link}
          >
            <Text style={styles.linkText}>Criar conta</Text>
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
