# Câmbio Real

Planejador de gastos em moeda estrangeira feito com React Native e Expo.

## O problema

Quem compra em dólar ou euro, seja numa viagem, seja num site internacional, quase nunca sabe quanto vai pagar de verdade em reais. A cotação muda todo dia e, no cartão, ainda entra o **IOF**. Os conversores comuns mostram só a taxa "seca", sem o imposto, e não ajudam a controlar quanto já foi gasto.

## A proposta

O **Câmbio Real** mostra o custo real de uma compra em reais, com o IOF incluído, e ajuda a planejar:

- converte valores entre 8 moedas usando a cotação do dia;
- salva as conversões em um histórico com observações;
- cria **orçamentos** (por exemplo, "Viagem Buenos Aires") com limite em reais e registra cada gasto na moeda original;
- avisa com uma **notificação** quando um orçamento passa de 80% do limite;
- funciona **offline** com a última cotação salva.

## Público-alvo

- Viajantes que querem controlar os gastos no exterior.
- Quem faz compras em sites internacionais e quer saber o valor final antes de pagar.
- Estudantes e intercambistas que lidam com outra moeda no dia a dia.

## Telas

| # | Tela | O que faz |
|---|------|-----------|
| 1 | **Converter** | Converte um valor entre duas moedas, com ou sem IOF, e mostra o valor sem IOF, o IOF e o total. Permite salvar no histórico. |
| 2 | **Cotações** | Lista quanto vale 1 unidade de cada moeda na moeda base, com pull-to-refresh e aviso de cotação offline. |
| 3 | **Histórico** | Lista as conversões salvas. Tocar edita a observação e a lixeira exclui. |
| 4 | **Orçamentos** | Lista os orçamentos com barra de progresso (verde, amarela e vermelha). Cria, edita e exclui orçamentos. |
| 5 | **Detalhe do orçamento** | Resumo (limite, gasto, quanto resta) e lista de gastos, com opção de adicionar, editar e excluir. |
| 6 | **Configurações** | Moedas padrão, percentual de IOF, teste de notificação, apagar dados e informações sobre o app. |

<!-- print: Converter -->

<!-- print: Cotações -->

<!-- print: Histórico -->

<!-- print: Orçamentos -->

<!-- print: Detalhe do orçamento -->

<!-- print: Configurações -->

<!-- print: Notificação de 80% -->

## Tecnologias

- **React Native** com **Expo SDK 57**, em JavaScript
- **Expo Router**: navegação por arquivos, com abas (`app/(tabs)`) e uma tela em pilha (`app/orcamento/[id].js`)
- **expo-sqlite**: banco local com as tabelas `conversions`, `budgets`, `expenses`, `settings` e `rates_cache`
- **expo-notifications**: notificações locais (o alerta de 80%)
- **API [exchangerate-api.com](https://www.exchangerate-api.com/)**: cotações das moedas
- **@expo/vector-icons** (Ionicons): ícones

### Organização do código

```
app/                  telas (cada arquivo é uma rota)
  _layout.js          SQLiteProvider + Stack
  (tabs)/             as 5 abas
  orcamento/[id].js   detalhe do orçamento
src/
  components/         componentes reutilizáveis (Button, Input, ResultCard...)
  database/           migrations e funções de CRUD de cada tabela
  services/api.js     busca de cotações com timeout e cache offline
  utils/              conversão, formatação, notificações e alerta de orçamento
  styles/             cores do tema e estilos de cada tela
```

## Como rodar

Pré-requisitos: Node.js instalado e o app **Expo Go** no celular.

```bash
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go (Android) ou com a câmera (iOS). O celular e o computador precisam estar na mesma rede Wi-Fi.

Se a rede bloquear a conexão (Wi-Fi da faculdade, por exemplo), use o modo túnel:

```bash
npx expo start --tunnel
```

Para a apresentação, há um botão **Carregar dados de exemplo** em Configurações (visível só em modo de desenvolvimento), que cria 5 conversões e 2 orçamentos.

> O percentual de IOF padrão é 3,5%. Confirme a alíquota vigente na Receita Federal.

## Integrantes

- Nome do integrante 1
- Nome do integrante 2
- Nome do integrante 3
