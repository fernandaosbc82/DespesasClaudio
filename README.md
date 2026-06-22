# Minhas Despesas de Viagem

Aplicativo web simples para registrar despesas de viagens de trabalho a partir de fotos de comprovantes, pensado para fácil uso por pessoas idosas (textos e botões grandes, navegação direta). Funciona tanto em celulares quanto em telas de computador.

## Funcionalidades

- Tela inicial com dois botões grandes: cadastrar novo gasto e ver painel.
- Cadastro de gasto via foto do comprovante (câmera do celular ou anexo da galeria) ou preenchimento manual.
- Leitura automática (OCR, no próprio navegador) da data e do valor do comprovante — sempre revisável antes de salvar.
- Campo único de "Km Rodado" por gasto, usado para estimar o consumo de combustível.
- Painel com totais por tipo de gasto, total geral e resumo mensal de Km rodado com consumo estimado (10 km/litro) e gasto estimado de combustível a partir do valor médio informado por mês.
- Exportação de todos os lançamentos para uma planilha Excel (.xlsx), incluindo o valor médio da gasolina e um resumo mensal de consumo.
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
