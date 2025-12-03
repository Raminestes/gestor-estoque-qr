import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useNavigation } from "@react-navigation/native";

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  function handleBarCodeScanned({ type, data }) {
    setScanned(true);

    try {
      const parsed = JSON.parse(data);

      if (!parsed.produtoId || !parsed.tipo) {
        Alert.alert("QR inválido", "Este código não pertence ao sistema.");
        setTimeout(() => setScanned(false), 1500);
        return;
      }

      navigation.navigate("Movement", {
        tipo: parsed.tipo,
        produtoId: parsed.produtoId,
      });

    } catch (err) {
      Alert.alert("QR inválido", "Não foi possível ler este QR.");
      setTimeout(() => setScanned(false), 1500);
    }
  }

  if (hasPermission === null) {
    return <Text style={{ padding: 20 }}>Pedindo permissão da câmera...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={{ padding: 20 }}>Permissão negada.</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />

      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Escanear novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
