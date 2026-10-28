# Tarefa: transformar o conversor de moedas no app "Câmbio Real" (6 telas, Expo Router + SQLite)

Você está no repositório de um app React Native com Expo (SDK 57) que hoje tem uma única tela em `App.js`, um conversor de moedas. Transforme-o em um **planejador de gastos em moeda estrangeira** chamado **Câmbio Real**: ele mostra quanto uma compra custa de verdade em reais (com IOF), salva conversões e controla orçamentos de viagem e compras.

É um trabalho acadêmico, apresentado ao vivo no **Expo Go em celular físico**. Os requisitos obrigatórios são: no mínimo 5 telas com navegação consistente, consumo de API e SQLite com CRUD. O código precisa ficar simples e bem organizado, porque cada um dos 3 integrantes vai explicar uma parte ao professor.

## Regras antes de começar

1. **Leia o `AGENTS.md`.** O Expo mudou: consulte a documentação versionada em https://docs.expo.dev/versions/v57.0.0/ para **expo-router**, **expo-sqlite** e **expo-notifications** antes de escrever código. Não use APIs antigas (por exemplo, o `SQLite.openDatabase` síncrono antigo ou `transaction`).
2. Instale as dependências **sempre** com `npx expo install ...`, para que as versões sejam compatíveis com o SDK 57. Não use `npm install` para pacotes Expo.
3. Use **JavaScript** (o projeto não usa TypeScript). Não adicione bibliotecas de UI, estado global ou ORM: use React Native puro, `useState`/`useEffect`/`useFocusEffect` e `@expo/vector-icons` (que já vem com o Expo).
4. Tudo precisa rodar no **Expo Go**, sem development build. Nada de módulos nativos fora do SDK.
5. Mantenha a identidade visual atual: tema escuro de `src/styles/colors.js` e os componentes existentes (`Button`, `Input`, `ResultCard`). Crie componentes novos em `src/components/` quando algo se repetir.
6. Toda a interface deve estar em **português do Brasil**.
7. Faça **um commit por etapa** (as etapas estão no fim deste arquivo), com mensagens claras em português. Não faça push.

## 1. Migração para Expo Router

- `npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar`
- Em `package.json`, troque `"main"` para `"expo-router/entry"`.
- Em `app.json`, adicione `"scheme": "cambioreal"`, troque `name` para `"Câmbio Real"` e adicione os plugins `"expo-router"` e `"expo-sqlite"` (e o de notificações, se a documentação exigir).
- A lógica de `App.js` vira a tela Converter. Depois remova `App.js`, `app.styles.js` (mova os estilos para perto da tela) e `index.js`.

Estrutura final esperada:

```
app/
  _layout.js                 # raiz: SQLiteProvider + Stack
  (tabs)/
    _layout.js               # Tabs com as 5 abas e ícones Ionicons
    index.js                 # 1. Converter
    cotacoes.js              # 2. Cotações
    historico.js             # 3. Histórico
    orcamentos.js            # 4. Meus orçamentos
    configuracoes.js         # 6. Configurações
  orcamento/
    [id].js                  # 5. Detalhe do orçamento (tela em pilha)
src/
  components/                # Button, Input, ResultCard + novos
  constants/currencies.js
  database/
    migrations.js            # CREATE TABLE + valores padrão
    conversions.js           # CRUD de conversões
    budgets.js               # CRUD de orçamentos
    expenses.js              # CRUD de gastos
    settings.js              # ler/gravar configurações
    ratesCache.js            # cache da última cotação
  services/api.js
  utils/convertCurrency.js
  utils/formatMoney.js
  utils/notifications.js
  styles/colors.js
```

Navegação:
- O `Stack` raiz contém `(tabs)` sem header e `orcamento/[id]` com header e botão voltar (título = nome do orçamento).
- As abas, nesta ordem: Converter (`swap-horizontal`), Cotações (`trending-up`), Histórico (`time`), Orçamentos (`wallet`), Configurações (`settings`). A barra de abas e os headers usam as cores do tema escuro.

## 2. Banco SQLite (expo-sqlite)

- Use `SQLiteProvider` no `app/_layout.js` com `databaseName="cambioreal.db"` e `onInit={migrateDbIfNeeded}`. Nas telas, use `useSQLiteContext()`.
- Em `migrations.js`, use `PRAGMA user_version` para versionar e rode `PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`.
- Use sempre a API assíncrona (`runAsync`, `getAllAsync`, `getFirstAsync`, `execAsync`) e **parâmetros `?`**, nunca concatenando strings em SQL.

Schema:

```sql
CREATE TABLE IF NOT EXISTS conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  amount REAL NOT NULL,
  rate REAL NOT NULL,
  iof_percent REAL NOT NULL DEFAULT 0,   -- 0 quando o IOF não foi incluído
  result REAL NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  limit_brl REAL NOT NULL,
  alert_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  rate REAL NOT NULL,
  iof_percent REAL NOT NULL DEFAULT 0,
  total_brl REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rates_cache (
  base TEXT PRIMARY KEY,
  rates_json TEXT NOT NULL,
  fetched_at TEXT NOT NULL
);
```

Valores padrão de `settings` (com `INSERT OR IGNORE`): `default_from = 'USD'`, `default_to = 'BRL'`, `iof_percent = '3.5'`, `include_iof = '1'`.

Cada arquivo de `src/database/` exporta funções nomeadas e fáceis de mostrar na apresentação, recebendo `db` como primeiro argumento. Por exemplo: `createConversion(db, data)`, `listConversions(db)`, `updateConversionNote(db, id, note)`, `deleteConversion(db, id)`; o mesmo padrão para `budgets` e `expenses`. Inclua `getBudgetsWithTotals(db)`, que devolve cada orçamento com o `SUM(total_brl)` dos gastos (via `LEFT JOIN` + `GROUP BY`).

## 3. Correções obrigatórias no código atual

- **Vírgula decimal:** em `convertCurrency.js`, crie `parseAmount(text)`, que aceita "10,50", "10.50" e "1.234,56" e devolve `NaN` quando o valor for inválido. Hoje `parseFloat("10,50")` vira 10. Use essa função em todo lugar onde há valor digitado.
- `convertCurrency(amount, rate, iofPercent = 0)` deve devolver um **number** (não uma string com `toFixed`). A formatação fica em `formatMoney(value, code)`, que usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: code })`, com fallback manual caso o `Intl` falhe.
- **`api.js`:** cheque `response.ok`, lance um erro em vez de só fazer `console.log`, e use um timeout com `AbortController` (8 s). Em caso de sucesso, grave o resultado em `rates_cache`. Em caso de falha, use o cache e informe na tela "Cotação offline de DD/MM HH:mm". Sem cache, mostre uma mensagem de erro amigável.
- Em `Button`, use ou remova a prop `variant`, que hoje não faz nada.
- Valide as entradas: valor vazio, zero ou inválido desabilita o botão ou mostra o erro embaixo do campo.

## 4. As telas

**1. Converter (`(tabs)/index.js`)**: a tela atual, com:
- Moedas iniciais vindas de `settings` (recarregadas com `useFocusEffect`).
- Um `Switch` "Incluir IOF (X%)" que usa o percentual configurado.
- O resultado mostra o valor sem IOF, o valor do IOF e o **total**, além da taxa "1 USD = 5,xxxx BRL".
- Um botão **Salvar no histórico** (só aparece quando há resultado), que grava em `conversions` e mostra a confirmação ("Salvo no histórico").
- Mantenha o botão de inverter moedas.

**2. Cotações (`(tabs)/cotacoes.js`)**: uma `FlatList` com as 8 moedas de `currencies.js` contra a moeda base (padrão BRL; um seletor no topo permite trocar):
- Cada linha mostra código, nome e quanto vale 1 unidade daquela moeda na moeda base.
- `RefreshControl` para puxar e atualizar, `ActivityIndicator` no primeiro carregamento, e "Atualizado às HH:mm" (ou o aviso de offline).

**3. Histórico (`(tabs)/historico.js`)**: `FlatList` de `conversions`, da mais recente para a mais antiga, recarregada com `useFocusEffect`:
- Cada item mostra "100,00 USD → R$ 545,20", a data, se teve IOF, e a observação.
- Tocar no item abre um `Modal` para editar a observação (Update).
- Botão de lixeira com `Alert.alert` de confirmação (Delete).
- Estado vazio: "Nenhuma conversão salva ainda. Converta algo e toque em Salvar."

**4. Meus orçamentos (`(tabs)/orcamentos.js`)**:
- Lista os orçamentos com nome, gasto/limite em R$ e uma barra de progresso (verde até 80%, amarela de 80% a 100%, vermelha acima disso).
- Um botão "+ Novo orçamento" abre um `Modal` com nome e limite em R$ (Create, com validação).
- Pressionar e segurar um item permite editar ou excluir. Excluir apaga os gastos em cascata.
- Tocar em um item navega com `router.push(\`/orcamento/${id}\`)`.
- Estado vazio com uma chamada para criar o primeiro orçamento.

**5. Detalhe do orçamento (`orcamento/[id].js`)**: tela em pilha, com `useLocalSearchParams`:
- Um cabeçalho com o resumo: limite, total gasto, quanto resta e a barra de progresso.
- A lista de gastos: descrição, valor na moeda original e o total em R$.
- Um formulário para adicionar gasto: descrição, valor, moeda (chips com as 8 moedas) e o switch de IOF. Ao salvar, busque a cotação na API (com o fallback de cache), calcule `total_brl` e grave em `expenses`.
- Tocar em um gasto permite editá-lo; há também um botão de excluir com confirmação.
- **Alerta:** depois de adicionar um gasto, se o total passar de 80% do limite e `alert_sent = 0`, dispare uma **notificação local** e marque `alert_sent = 1`. Se o total voltar a ficar abaixo de 80%, volte o campo para 0.

**6. Configurações (`(tabs)/configuracoes.js`)**:
- Moeda de origem padrão e moeda de destino padrão (chips).
- Percentual de IOF (campo numérico com `parseAmount`) e se o IOF fica ligado por padrão.
- Um botão "Testar notificação".
- Um botão "Apagar todos os dados", com confirmação dupla, que limpa as tabelas e restaura os padrões.
- Uma seção "Sobre": nome do app, versão (`expo-constants`), fonte das cotações (exchangerate-api.com) e o aviso "Confirme a alíquota de IOF vigente na Receita Federal".

## 5. Notificações (`src/utils/notifications.js`)

- `npx expo install expo-notifications`.
- Use apenas **notificações locais** (`scheduleNotificationAsync` com `trigger: null`). Notificações push remotas não funcionam no Expo Go; não implemente push.
- Configure `setNotificationHandler` para mostrar o alerta com o app aberto. No Android, crie um canal "alertas".
- Exporte `ensurePermission()`, que pede a permissão na primeira vez e devolve `true`/`false`. Se o usuário negar, o app continua funcionando e mostra um `Alert` explicando.

## 6. Dados de exemplo para a demo

Em Configurações, acrescente o botão **"Carregar dados de exemplo"**, visível apenas quando `__DEV__` for verdadeiro. Ele cria 5 conversões e 2 orçamentos ("Viagem Buenos Aires", limite R$ 3.000, com 3 gastos em USD; "Compras online", limite R$ 800, com 2 gastos em USD/EUR, perto dos 80%).

## 7. README

Reescreva o `README.md` com: o problema e a proposta, o público-alvo, a lista das 6 telas, as tecnologias, como rodar (`npm install`, `npx expo start`, e `npx expo start --tunnel` se a rede bloquear) e espaços marcados como `<!-- print -->` para colocarmos os prints. Deixe uma seção "Integrantes" com 3 nomes a preencher.

## Etapas (um commit por etapa)

1. Migração para Expo Router com as 6 telas vazias e a navegação funcionando.
2. Banco: migrations + arquivos de `src/database/`.
3. Correções da seção 3 (parseAmount, api.js com cache, formatMoney).
4. Converter + Cotações + Configurações.
5. Histórico (CRUD de conversões).
6. Orçamentos + Detalhe (CRUD de orçamentos e gastos) + notificação.
7. Dados de exemplo + README.

Depois de cada etapa, rode `npx expo start` (ou `npx expo export --platform android` para checar se o bundle compila) e corrija os erros antes de seguir.

## Critérios de pronto (confira um por um no final e me mostre o resultado)

- [ ] O app abre no Expo Go sem erro nem warning vermelho.
- [ ] As 5 abas e a tela de detalhe navegam, e o botão voltar funciona.
- [ ] "10,50" USD converte corretamente (não como 10).
- [ ] Com o modo avião ligado, Cotações e Converter usam o cache e mostram o aviso de offline.
- [ ] Converter → Salvar → a conversão aparece no Histórico sem precisar reiniciar o app.
- [ ] Histórico: editar a observação e excluir funcionam.
- [ ] Orçamentos: criar, editar, excluir (com os gastos em cascata) e a barra de progresso funcionam.
- [ ] Detalhe: adicionar, editar e excluir gasto atualizam o resumo na hora.
- [ ] Passar de 80% do limite dispara a notificação apenas uma vez.
- [ ] Ao fechar o app por completo e abrir de novo, todos os dados continuam lá.
- [ ] Mudar a moeda padrão e o IOF em Configurações reflete no Converter.
- [ ] Nenhuma query SQL monta strings com os valores do usuário.

No final, me entregue um resumo curto com: arquivos criados e alterados, como testar cada tela, e qualquer coisa da documentação do SDK 57 que tenha sido diferente do que este prompt supõe.
