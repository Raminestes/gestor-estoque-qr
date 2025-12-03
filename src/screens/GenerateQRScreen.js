import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from "react-native";
import { supabase } from "../lib/supabase";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";

export default function GenerateQRScreen() {
  const navigation = useNavigation();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [qrData, setQrData] = useState(null);

  // ================================
  // CARREGAR PRODUTOS
  // ================================
  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar os produtos.");
        return;
      }

      setProdutos(data);
      setLoading(false);
    }

    load();
  }, []);

  // ================================
  // GERAR QR E MOSTRAR MODAL
  // ================================
  function abrirQR(produto, tipo) {
    /*
      NOVO PADRÃO DO QR PARA FUNCIONAR COM O SCANNER:

      QR:PRODUTO-<id>-<tipo>

      Exemplo:
      QR:PRODUTO-7-entrada
    */
    const valor = `QR:PRODUTO-${produto.id}-${tipo}`;

    setQrData(valor);
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>

      {/* 🔙 BOTÃO VOLTAR */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerar QR Code</Text>
      </View>

      {/* LISTA DE PRODUTOS */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>

        {produtos.map((p) => (
          <View key={p.id} style={styles.card}>

            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{p.nome}</Text>
              <Text style={styles.productQty}>{p.quantidade} un</Text>

              {p.preco !== null && (
                <Text style={styles.productPrice}>
                  R$ {Number(p.preco).toFixed(2).replace(".", ",")}
                </Text>
              )}
            </View>

            <View style={styles.buttons}>

              {/* QR ENTRADA */}
              <TouchableOpacity
                style={styles.qrButtonEntrada}
                onPress={() => abrirQR(p, "entrada")}
              >
                <Text style={styles.qrButtonText}>QR Entrada</Text>
              </TouchableOpacity>

              {/* QR SAÍDA */}
              <TouchableOpacity
                style={styles.qrButtonSaida}
                onPress={() => abrirQR(p, "saida")}
              >
                <Text style={styles.qrButtonText}>QR Saída</Text>
              </TouchableOpacity>

            </View>

          </View>
        ))}

        {produtos.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 30, color: "#777" }}>
            Nenhum produto cadastrado.
          </Text>
        )}

      </ScrollView>

      {/* ======================
           MODAL DO QR CODE
         ====================== */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>QR Code</Text>

            {qrData && (
              <QRCode
                value={qrData}
                size={220}
                backgroundColor="white"
                color="black"
              />
            )}

            <Text style={styles.codeText}>{qrData}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

    </View>
  );
}



// ================================
// ESTILOS
// ================================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5",
    paddingTop: 40,
  },

  // Voltar
  backButton: {
    marginLeft: 16,
    marginBottom: 5
  },
  backButtonText: {
    fontSize: 18,
    color: "#1565C0",
    fontWeight: "700"
  },

  header: {
    height: 70,
    backgroundColor: "#424242",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  scroll: { padding: 20 },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  productName: { fontSize: 16, fontWeight: "700", color: "#333" },
  productQty: { fontSize: 14, color: "#2E7D32", marginTop: 4 },
  productPrice: { fontSize: 14, color: "#444", marginTop: 4 },

  buttons: { justifyContent: "center", gap: 8 },

  qrButtonEntrada: {
    backgroundColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  qrButtonSaida: {
    backgroundColor: "#C62828",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  qrButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  modalBox: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 14,
    alignItems: "center",
    width: "80%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },

  codeText: {
    marginTop: 12,
    color: "#444",
    fontSize: 14,
  },

  closeButton: {
    marginTop: 30,
    backgroundColor: "#1976D2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  closeButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
