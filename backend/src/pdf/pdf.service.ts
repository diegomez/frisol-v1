import { Injectable, ForbiddenException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ProjectsService } from '../projects/projects.service';
import { SymptomsService } from '../symptoms/symptoms.service';
import { CausasService } from '../causas/causas.service';
import { KpisService } from '../kpis/kpis.service';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class PdfService {
  constructor(
    private projectsService: ProjectsService,
    private symptomsService: SymptomsService,
    private causasService: CausasService,
    private kpisService: KpisService,
    private attachmentsService: AttachmentsService,
  ) {}

  async generatePdf(projectId: string): Promise<Buffer> {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado === 'en_progreso') {
      throw new ForbiddenException('El proyecto debe estar terminado o cerrado para exportar PDF');
    }

    const symptoms = await this.symptomsService.findByProjectId(projectId);
    const causas = await this.causasService.findByProjectId(projectId);
    const kpis = await this.kpisService.findByProjectId(projectId);
    const attachments = await this.attachmentsService.findByProjectId(projectId);

    const html = this.buildHtml(project, symptoms, causas, kpis, attachments);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private buildHtml(project: any, symptoms: any[], causas: any[], kpis: any[], attachments: any[]): string {
    const estadoLabel = project.estado === 'terminado' ? 'Terminado' : 'Cerrado';
    const estadoColor = project.estado === 'terminado' ? '#16a34a' : '#6b7280';

    const symptomsHtml = symptoms.length > 0
      ? symptoms.map((s, i) => `
        <div class="section-item">
          <h4>Síntoma #${i + 1}</h4>
          <p><strong>Qué sucede:</strong> ${this.escapeHtml(s.what)}</p>
          <p><strong>Quién está involucrado:</strong> ${this.escapeHtml(s.who)}</p>
          <p><strong>Cuándo ocurre:</strong> ${this.escapeHtml(s.when_field)}</p>
          <p><strong>Dónde pasa:</strong> ${this.escapeHtml(s.where_field)}</p>
          <p><strong>Cómo se manifiesta:</strong> ${this.escapeHtml(s.how)}</p>
          <p><strong>Declaración:</strong> ${this.escapeHtml(s.declaration)}</p>
        </div>
      `).join('')
      : '<p class="empty">No hay síntomas cargados.</p>';

    const causasHtml = causas.length > 0
      ? causas.map((c, i) => {
        const origins = [c.origin_metodo && 'Método', c.origin_maquina && 'Máquina', c.origin_gobernanza && 'Gobernanza'].filter(Boolean).join(', ');
        return `
          <div class="section-item">
            <h4>Causa #${i + 1}</h4>
            <p><strong>Por qué 1:</strong> ${this.escapeHtml(c.why_1)}</p>
            <p><strong>Por qué 2:</strong> ${this.escapeHtml(c.why_2)}</p>
            <p><strong>Por qué 3:</strong> ${this.escapeHtml(c.why_3)}</p>
            ${c.why_4 ? `<p><strong>Por qué 4:</strong> ${this.escapeHtml(c.why_4)}</p>` : ''}
            ${c.why_5 ? `<p><strong>Por qué 5:</strong> ${this.escapeHtml(c.why_5)}</p>` : ''}
            <p class="root-cause"><strong>Causa raíz:</strong> ${this.escapeHtml(c.root_cause)}</p>
            <p><strong>Origen:</strong> ${origins}</p>
          </div>
        `;
      }).join('')
      : '<p class="empty">No hay causas cargadas.</p>';

    const kpisHtml = kpis.length > 0
      ? `<table>
          <thead><tr><th>Nombre</th><th>Valor Actual</th><th>Valor Objetivo</th></tr></thead>
          <tbody>
            ${kpis.map(k => `<tr><td>${this.escapeHtml(k.nombre)}</td><td>${this.escapeHtml(k.valor_actual)}</td><td>${this.escapeHtml(k.valor_objetivo)}</td></tr>`).join('')}
          </tbody>
        </table>`
      : '<p class="empty">No hay KPIs cargados.</p>';

    const attachmentsHtml = attachments.length > 0
      ? `<table>
          <thead><tr><th>Título</th><th>Archivo</th><th>Tamaño</th><th>Fecha</th></tr></thead>
          <tbody>
            ${attachments.map(a => `<tr><td>${this.escapeHtml(a.title)}</td><td>${this.escapeHtml(a.original_name)}</td><td>${Math.round(a.file_size / 1024)} KB</td><td>${new Date(a.uploaded_at).toLocaleDateString('es-AR')}</td></tr>`).join('')}
          </tbody>
        </table>`
      : '<p class="empty">No hay archivos adjuntos.</p>';

    // Build audit trail
    const formatDate = (d: Date) => {
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const mi = String(date.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
    };
    const formatDateShort = (d: Date) => {
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    let auditHtml = '';
    if (project.terminado_user) {
      auditHtml += `<tr><td><span class="audit-badge terminado">Terminado</span></td><td>${this.escapeHtml(project.terminado_user.name)}</td><td>${formatDate(project.terminado_at)}</td></tr>`;
    }
    if (project.cerrado_user) {
      auditHtml += `<tr><td><span class="audit-badge cerrado">Cerrado</span></td><td>${this.escapeHtml(project.cerrado_user.name)}</td><td>${formatDate(project.cerrado_at)}</td></tr>`;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.5; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 22px; color: #1e40af; margin-bottom: 5px; }
        .header .subtitle { font-size: 12px; color: #6b7280; }
        .header .meta { margin-top: 15px; }
        .header .client-data { font-size: 16px; color: #1e40af; font-weight: bold; line-height: 2; }
        .header .client-data .label { font-size: 12px; color: #6b7280; font-weight: normal; }
        .header .estado-row { margin-top: 10px; font-size: 11px; color: #6b7280; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; color: white; font-size: 10px; font-weight: bold; background-color: ${estadoColor}; }
        .section { margin-bottom: 20px; page-break-inside: avoid; }
        .section h2 { font-size: 14px; color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
        .section-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 8px; }
        .section-item h4 { font-size: 12px; color: #374151; margin-bottom: 5px; }
        .section-item p { margin-bottom: 3px; }
        .root-cause { background: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 4px; padding: 6px; margin-top: 5px; }
        .empty { color: #9ca3af; font-style: italic; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #f3f4f6; padding: 6px 8px; text-align: left; border: 1px solid #e5e7eb; }
        td { padding: 6px 8px; border: 1px solid #e5e7eb; }
        .text-block { white-space: pre-wrap; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
        .audit-section { margin-top: 20px; }
        .audit-section h2 { font-size: 14px; color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
        .audit-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; color: white; font-size: 9px; font-weight: bold; }
        .audit-badge.terminado { background-color: #16a34a; }
        .audit-badge.cerrado { background-color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FRISOL — Reporte de Proyecto</h1>
        <div class="subtitle">Framework 4D — Traspaso Comercial → Desarrollo</div>
        <div class="meta">
          <div class="client-data">
            <span class="label">ID Interno:</span> ${this.escapeHtml(project.internal_id || '—')}<br>
            <span class="label">Proyecto:</span> ${this.escapeHtml(project.nombre_proyecto || 'Sin nombre')}<br>
            <span class="label">Cliente:</span> ${this.escapeHtml(project.nombre_cliente || 'Sin cliente')}<br>
            <span class="label">ID CRM:</span> ${this.escapeHtml(project.crm_id || '—')}<br>
            <span class="label">Tribu:</span> ${this.escapeHtml(project.tribe?.name || '—')}<br>
            <span class="label">Fecha inicio:</span> ${project.fecha_inicio ? formatDateShort(new Date(project.fecha_inicio + 'T00:00:00')) : '—'}
          </div>
          <div class="estado-row">
            <strong>Estado:</strong> <span class="status-badge">${estadoLabel}</span> &nbsp;
            <strong>Generado:</strong> ${formatDateShort(new Date())}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>1. Cliente</h2>
        <p><strong>Interlocutores:</strong></p>
        <div class="text-block">${this.escapeHtml(project.interlocutores || 'No especificado')}</div>
      </div>

      <div class="section">
        <h2>2. Diagnóstico 5WTH</h2>
        ${symptomsHtml}
      </div>

      <div class="section">
        <h2>3. Evidencia</h2>
        <div class="text-block">${this.escapeHtml(project.evidencia || 'No hay datos cargados.')}</div>
      </div>

      <div class="section">
        <h2>4. Voz del Dolor</h2>
        <div class="text-block">${this.escapeHtml(project.voz_dolor || 'No hay datos cargados.')}</div>
      </div>

      <div class="section">
        <h2>5. Análisis de Causas</h2>
        ${causasHtml}
      </div>

      <div class="section">
        <h2>6. Impacto y Business Case</h2>
        <p><strong>Impacto en el negocio:</strong></p>
        <div class="text-block">${this.escapeHtml(project.impacto_negocio || 'No hay datos cargados.')}</div>
        <h4 style="margin-top: 10px;">KPIs / Métricas</h4>
        ${kpisHtml}
      </div>

      <div class="section">
        <h2>7. Archivos Adjuntos</h2>
        ${attachmentsHtml}
      </div>

      ${auditHtml ? `
      <div class="audit-section">
        <h2>Historial de cambios de estado</h2>
        <table>
          <thead><tr><th>Estado</th><th>Usuario</th><th>Fecha</th></tr></thead>
          <tbody>${auditHtml}</tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        Frisol v1 — Generado automáticamente — ${new Date().toISOString()}
      </div>
    </body>
    </html>
    `;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}