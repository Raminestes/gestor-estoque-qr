// QRScannerScreen.js CORRIGIDO

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

export default function QRScannerScreen() {
  const navigation = useNavigation();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  function tratarLeitura({ data }) {
    if (scanned) return;

    setScanned(true);

    const texto = String(data);

    if (!texto.startsWith("QR:PRODUTO-")) {
      Alert.alert("QR inválido", "Esse QR não pertence ao estoque.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      return;
    }

    // separação correta
    // Exemplo: QR:PRODUTO-7-entrada
    const partes = texto.replace("QR:PRODUTO-", "").split("-");

    const produtoId = Number(partes[0]);
    const tipo = partes[1]; // entrada ou saída

    if (!produtoId || !tipo) {
      Alert.alert("QR inválido!", "Formato incorreto.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      return;
    }

    navigation.navigate("Movement", {
      produtoId,
      tipo
    });
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Permita o uso da câmera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Permitir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Voltar</Text>
      </TouchableOpacity>

      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={tratarLeitura}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#1565C0",
    padding: 12,
    borderRadius: 10,
  },
  btnText: { color: "#FFF", fontWeight: "700" },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
