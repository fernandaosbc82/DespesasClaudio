# Minhas Despesas de Viagem

Aplicativo web simples para registrar despesas de viagens de trabalho a partir de fotos de comprovantes, pensado para fácil uso por pessoas idosas (textos e botões grandes, navegação direta).

## Funcionalidades

- Tela inicial com dois botões grandes: cadastrar novo gasto e ver painel.
- Cadastro de gasto via foto do comprovante (câmera do celular) ou preenchimento manual.
- Leitura automática (OCR, no próprio navegador) do nome do estabelecimento, tipo de gasto (combustível, alimentação ou outros), valor e data — sempre revisável antes de salvar.
- Painel com totais por tipo de gasto e total geral.
- Exportação de todos os lançamentos para uma planilha Excel (.xlsx).
- Dados salvos no próprio dispositivo (localStorage), sem necessidade de servidor.

## Executando localmente

```bash
npm install
npm run dev
```

Acesse o endereço exibido no terminal (geralmente http://localhost:5173).

## Build de produção

```bash
npm run build
npm run preview
```
