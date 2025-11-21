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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const validEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPass) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (!validEmail(email)) {
      Alert.alert("Erro", "Digite um email válido.");
      return;
    }

    if (password !== confirmPass) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 800));

      Alert.alert("Sucesso", "Conta criada com sucesso!");
      navigation.replace("Login");
    } catch (err) {
      Alert.alert("Erro", "Falha ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.subtitle}>Complete os dados abaixo</Text>

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
            label="Confirmar Senha"
            value={confirmPass}
            onChangeText={setConfirmPass}
            placeholder="••••••••"
            secureTextEntry
          />

          <PrimaryButton
            title={loading ? "Criando..." : "Criar Conta"}
            onPress={handleRegister}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>Já tenho conta — Entrar</Text>
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
    alignItems: "center",
    justifyContent: "center",
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
  loginLink: {
    marginTop: 14,
    alignItems: "center",
  },
  loginText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});
