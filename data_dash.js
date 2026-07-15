// ===== TEMPLATE DE DADOS — PREENCHIDO PELO N8N =====
// Arquivo MODELO (vazio) que o dashboard consome. O n8n substitui o objeto abaixo.
//
// Estrutura única (métricas + comentários juntos — tudo em um só lugar):
//   {
//     eventos:      [{ id, data, curso, area, mod, inscritos, confirmados, aval, taxa, nota, nps }],
//     palestrantes: [{ id_evento, nome, aval, nota, nps }],
//     comentarios:  { "<id_evento>": [ comentario, ... ] }
//   }
//
// Campos de cada evento:
//   id           number  — identificador único do evento
//   data         number  — serial de planilha (dias desde 1899-12-30) OU "YYYY-MM-DD" / "DD/MM/YYYY"
//   curso        string  — nome do curso/evento
//   area         string  — área temática
//   mod          string  — "Online" | "Presencial" | "Híbrido"
//   inscritos    number
//   confirmados  number
//   aval         number  — quantidade de avaliações respondidas
//   taxa         number  — taxa de resposta (0–1, ex.: 0.48 = 48%)
//   nota         number  — nota média (0–10)
//   nps          number  — NPS ponderado (0–100)
//
// comentarios: TEXTOS completos por evento. Cada item pode ser:
//   • uma string:  "O curso foi excelente..."
//   • ou um objeto: { nome?: string, nota?: number (0–10), texto: string }
// A aba "Comentários" mostra a lista completa; o "Acervo" mostra uma prévia.
// A contagem exibida é o tamanho dessa lista.
//
// Um exemplo completo com dados reais está em data_dash_exemplo.js.
// (Se o data_dash.js estiver vazio, o dashboard carrega o exemplo automaticamente.)

window.__DASH__ = {
  eventos: [],
  palestrantes: [],
  comentarios: {}
};
