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

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function validEmail(e) {
    const re = /\S+@\S+\.\S+/;
    return re.test(e);
  }

 async function handleLogin() {
  if (!email || !password) {
    Alert.alert("Erro", "Preencha email e senha.");
    return;
  }

  if (!validEmail(email)) {
    Alert.alert("Erro", "Digite um email válido.");
    return;
  }

  setLoading(true);


  await new Promise((resolve) => setTimeout(resolve, 800));

  setLoading(false);

  navigation.replace("Dashboard");
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

        <Text style={styles.title}>Gestor de Estoque</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <View style={styles.form}>
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
            secureTextEntry
            placeholder="••••••••"
          />

          <PrimaryButton
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    alignItems: "center",
  },
  logo: {
    width: 92,
    height: 92,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#212121",
  },
  subtitle: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 18,
  },
  form: {
    width: "100%",
    marginTop: 6,
  },
  registerLink: {
    marginTop: 14,
    alignItems: "center",
  },
  registerText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});
