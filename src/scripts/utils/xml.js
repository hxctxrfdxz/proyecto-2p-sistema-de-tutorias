const CLAVE_XML_SOLICITUDES = "solicitudesTutoriaXML";

export function asegurarXMLSolicitudes() {
  const xml = localStorage.getItem(CLAVE_XML_SOLICITUDES);
  if (xml && xml.trim().length > 0) return;

  const inicial = [
    { id: 1, estudianteId: 1, estudiante: "Ana García", tutor: "Carlos López", titulo: "Dudas sobre el capítulo 3", fecha: "2026-01-20", hora: "10:00", estado: "pendiente", fechaSolicitud: "2026-01-18" },
    { id: 2, estudianteId: 4, estudiante: "Juan Pérez", tutor: "Laura Martínez", titulo: "Revisión de propuesta", fecha: "2026-01-22", hora: "14:30", estado: "confirmada", fechaSolicitud: "2026-01-17" },
  ];

  localStorage.setItem(CLAVE_XML_SOLICITUDES, convertirSolicitudesA_XML(inicial));
}

export function leerXMLSolicitudes() {
  const xml = localStorage.getItem(CLAVE_XML_SOLICITUDES) || "";
  if (!xml.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const nodos = Array.from(doc.getElementsByTagName("solicitud"));

  return nodos.map((n) => ({
    id: Number(n.getAttribute("id")),
    estudianteId: Number(texto(n, "estudianteId")),
    estudiante: texto(n, "estudiante"),
    tutor: texto(n, "tutor"),
    titulo: texto(n, "titulo"),
    fecha: texto(n, "fecha"),
    hora: texto(n, "hora"),
    estado: texto(n, "estado"),
    fechaSolicitud: texto(n, "fechaSolicitud"),
    descripcion: texto(n, "descripcion"),
  }));
}

export function guardarXMLSolicitudes(solicitudes) {
  localStorage.setItem(CLAVE_XML_SOLICITUDES, convertirSolicitudesA_XML(solicitudes));
}

function texto(nodoSolicitud, tag) {
  const n = nodoSolicitud.getElementsByTagName(tag)[0];
  return n ? n.textContent || "" : "";
}

function escaparXml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function convertirSolicitudesA_XML(solicitudes) {
  const cuerpo = solicitudes
    .map((s) => {
      return `
  <solicitud id="${escaparXml(s.id)}">
    <estudianteId>${escaparXml(s.estudianteId)}</estudianteId>
    <estudiante>${escaparXml(s.estudiante)}</estudiante>
    <tutor>${escaparXml(s.tutor)}</tutor>
    <titulo>${escaparXml(s.titulo)}</titulo>
    <fecha>${escaparXml(s.fecha)}</fecha>
    <hora>${escaparXml(s.hora)}</hora>
    <estado>${escaparXml(s.estado)}</estado>
    <fechaSolicitud>${escaparXml(s.fechaSolicitud)}</fechaSolicitud>
    <descripcion>${escaparXml(s.descripcion || "")}</descripcion>
  </solicitud>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<solicitudesTutoria>
${cuerpo}
</solicitudesTutoria>`;
}
