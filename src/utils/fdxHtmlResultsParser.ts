import type { NomeConsultaResultado } from "@/services/buscaNomeService";

/**
 * Extrai resultados do HTML de `api.fdxapis.us/temp/...`.
 * Mantém campos principais e também preserva colunas extras retornadas no HTML.
 */
export function parseFdxHtmlResults(html: string): NomeConsultaResultado[] {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return [];

  const headerCells = Array.from(table.querySelectorAll("thead th")).map((th) => normalizeText(th.textContent || ""));
  const bodyRows = Array.from(table.querySelectorAll("tbody tr"));
  const fallbackRows = bodyRows.length > 0 ? bodyRows : Array.from(table.querySelectorAll("tr")).slice(1);

  return fallbackRows
    .map((row) => parseRow(row as HTMLTableRowElement, headerCells))
    .filter(Boolean) as NomeConsultaResultado[];
}

function parseRow(tr: HTMLTableRowElement, headers: string[]): NomeConsultaResultado | null {
  const tds = Array.from(tr.querySelectorAll("td"));
  if (tds.length === 0) return null;

  const mapped: Record<string, string> = {};

  tds.forEach((td, index) => {
    const rawValue = normalizeText(td.textContent || "");
    if (!rawValue) return;

    const header = headers[index] || `campo_${index + 1}`;
    const normalizedKey = normalizeHeaderToKey(header, index);

    mapped[normalizedKey] = normalizeFieldValue(normalizedKey, rawValue);
  });

  const nome = mapped.nome || "-";
  const cpf = mapped.cpf || "-";
  const nascimento = mapped.nascimento || "-";

  if (!nome && !cpf && !nascimento && Object.keys(mapped).length === 0) return null;

  return {
    nome,
    cpf,
    nascimento,
    idade: mapped.idade || "",
    sexo: mapped.sexo || "",
    enderecos: mapped.enderecos || "",
    cidades: mapped.cidades || "",
    nome_mae: mapped.nome_mae || "",
    ...mapped,
  };
}

function normalizeHeaderToKey(header: string, index: number): string {
  const normalized = normalizeText(header)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!normalized) return `campo_${index + 1}`;

  if (normalized.includes("nome") && normalized.includes("mae")) return "nome_mae";
  if (normalized.includes("nome") && !normalized.includes("pai")) return "nome";
  if (normalized.includes("cpf")) return "cpf";
  if (normalized.includes("nascimento") || normalized.includes("nasc")) return "nascimento";
  if (normalized.includes("idade")) return "idade";
  if (normalized.includes("sexo")) return "sexo";
  if (normalized.includes("endereco")) return "enderecos";
  if (normalized.includes("cidade")) return "cidades";

  return normalized
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || `campo_${index + 1}`;
}

function normalizeFieldValue(key: string, value: string): string {
  if (key === "nascimento") {
    return extractDate(value) || (value.split("\n")[0] || value).trim();
  }

  if (key === "nome") {
    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return (lines.length >= 2 ? lines[1] : lines[0] || "").trim();
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" | ");
}

function normalizeText(value: string): string {
  return (value || "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function extractDate(text: string): string | null {
  const m = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
  return m?.[0] ?? null;
}
