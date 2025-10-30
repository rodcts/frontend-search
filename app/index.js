// --- NO ARQUIVO app/index.js ---
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Picker, Alert, ScrollView } from 'react-native';

// MUITO IMPORTANTE: Use o SEU ENDEREÇO IP LOCAL (ex: 'http://192.168.1.15:9001/avaliar')
const API_URL = 'http://localhost:9001/avaliar'; 
// const API_URL = 'http://192.168.1.140:9001/avaliar'; 

export default function HomeScreen() {
  const [produto, setProduto] = useState('');
  
  // (MUDANÇA 1) Adiciona o estado para o seletor
  const [estado, setEstado] = useState('bom'); // Valor padrão "bom"
  
  const [resultado, setResultado] = useState(null); // Armazenará a resposta detalhada
  const [loading, setLoading] = useState(false);

  // Mapeamento dos valores que a API espera
  const estados = [
    { label: 'Novo (Lacrado)', value: 'novo' },
    { label: 'Excelente (Sem marcas)', value: 'excelente' },
    { label: 'Bom (Marcas de uso)', value: 'bom' },
    { label: 'Com Defeito (Tela quebrada, etc)', value: 'defeito' },
  ];

  const formatarMoeda = (valor) => {
    const numero = Number(valor);
    if (isNaN(numero)) {
      return 'N/A';
    }
    return numero.toFixed(2).replace('.', ',');
  };

  const avaliarProduto = async () => {
    if (!produto.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do produto.');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // (MUDANÇA 2) Envia o nome do produto E o estado selecionado
        body: JSON.stringify({ 
          produto: produto,
          estado: estado 
        }), 
      });

      const data = await response.json();

      if (response.status === 200) {
        setResultado(data); // Salva a resposta detalhada (com min, max, etc.)
      } else {
        // Exibe o erro retornado pela API (ex: 503 ou 400)
        Alert.alert('Erro na API', data.detail || 'Não foi possível avaliar o produto.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Python. Verifique o IP e a porta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seu Próximo Preço</Text> 

      <Text style={styles.label}>Nome (Marca e Modelo):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: iPhone 13 128gb"
        value={produto}
        onChangeText={setProduto}
      />

      {/* (MUDANÇA 3) Adiciona o seletor de "Estado" */}
      <Text style={styles.label}>Estado de Conservação:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={estado}
          style={styles.picker}
          onValueChange={(itemValue) => setEstado(itemValue)}
        >
          {estados.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}
        </Picker>
      </View>

      <Button
        title={loading ? "Avaliando..." : "Avaliar Preço"}
        onPress={avaliarProduto}
        disabled={loading}
      />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#0000ff" />}

      {/* (MUDANÇA 4) Atualiza a área de resultado para a Resposta Detalhada */}
      {resultado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Preço Sugerido (Competitivo):</Text>
          <Text style={styles.resultValue}>
            R$ {formatarMoeda(resultado.preco_sugerido)}
          </Text>
          
          <Text style={styles.detailText}>
            Faixa de Preço Encontrada: 
            <Text style={styles.boldText}> R$ {formatarMoeda(resultado.preco_min)}</Text> a 
            <Text style={styles.boldText}> R$ {formatarMoeda(resultado.preco_max)}</Text>
          </Text>
          
          <Text style={styles.smallText}>
            (Baseado em {resultado.anuncios_analisados} anúncios analisados)
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// --- Atualização dos Estilos ---
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#e6ffe6', 
    borderColor: '#00cc00',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#008000', 
    marginTop: 10,
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});