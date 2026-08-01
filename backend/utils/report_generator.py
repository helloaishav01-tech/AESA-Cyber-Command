"""
Generates a professional PDF incident report from a saved analysis.
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem

SEVERITY_COLORS = {"safe": "#0E7490", "warning": "#C2410C", "critical": "#B91C1C"}


def generate_report_pdf(analysis: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], fontSize=20, spaceAfter=4)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body = styles["BodyText"]
    small = ParagraphStyle("Small", parent=styles["BodyText"], fontSize=9, textColor=HexColor("#64748B"))

    severity = analysis.get("severity", "safe")
    sev_color = SEVERITY_COLORS.get(severity, "#0E7490")

    elements = []
    elements.append(Paragraph("AESA Security Incident Report", title_style))
    elements.append(Paragraph(
        f"Generated {datetime.now().strftime('%B %d, %Y at %H:%M')}", small
    ))
    elements.append(Spacer(1, 12))

    # Executive summary block
    sev_style = ParagraphStyle("Sev", parent=body, textColor=HexColor(sev_color), fontSize=14)
    elements.append(Paragraph(f"Severity: {severity.upper()}", sev_style))
    elements.append(Paragraph(f"<b>Threat Type:</b> {analysis.get('threat_type', 'Unknown')}", body))
    elements.append(Paragraph(f"<b>Source IP:</b> {analysis.get('source_ip') or 'Not identified'}", body))
    elements.append(Paragraph(
        f"<b>AI Confidence:</b> {analysis.get('confidence_score', 0)}/100 - {analysis.get('confidence_reasoning', '')}",
        body
    ))

    ti = analysis.get("threat_intel", {})
    if ti.get("checked"):
        intel_line = f"<b>Threat Intelligence (AbuseIPDB):</b> "
        if ti.get("is_known_malicious"):
            intel_line += f"Confirmed - {ti.get('total_reports', 0)} prior abuse reports, confidence {ti.get('abuse_confidence_score')}%"
        else:
            intel_line += f"No strong external corroboration ({ti.get('total_reports', 0)} reports, {ti.get('abuse_confidence_score')}% confidence)"
        elements.append(Paragraph(intel_line, body))

    elements.append(Spacer(1, 8))
    elements.append(Paragraph("Executive Summary", h2))
    elements.append(Paragraph(analysis.get("forensic_summary", ""), body))

    # Timeline
    timeline = analysis.get("timeline", [])
    if timeline:
        elements.append(Paragraph("Attack Timeline", h2))
        rows = [["Time", "Event"]] + [[t.get("time_estimate", ""), t.get("event", "")] for t in timeline]
        table = Table(rows, colWidths=[1 * inch, 5 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1F2634")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(table)

    # Root cause
    root_causes = analysis.get("root_cause", [])
    if root_causes:
        elements.append(Paragraph("Root Cause Analysis", h2))
        elements.append(ListFlowable(
            [ListItem(Paragraph(rc, body)) for rc in root_causes], bulletType="bullet"
        ))

    # MITRE mapping
    mitre = analysis.get("mitre_techniques", [])
    if mitre:
        elements.append(Paragraph("MITRE ATT&CK Techniques", h2))
        elements.append(ListFlowable(
            [ListItem(Paragraph(m, body)) for m in mitre], bulletType="bullet"
        ))

    # Risk score
    risk = analysis.get("risk_score", {})
    if risk:
        elements.append(Paragraph(f"Risk Score: {risk.get('score', 0)}/100", h2))
        factors = risk.get("factors", [])
        if factors:
            elements.append(ListFlowable(
                [ListItem(Paragraph(f, body)) for f in factors], bulletType="bullet"
            ))

    # Remediation
    commands = analysis.get("mitigation_commands", [])
    if commands:
        elements.append(Paragraph("Recommended Remediation Commands", h2))
        mono_style = ParagraphStyle("Mono", parent=body, fontName="Courier", fontSize=9,
                                     backColor=HexColor("#0F172A"), textColor=HexColor("#7DD3FC"),
                                     borderPadding=6, spaceAfter=4)
        for cmd in commands:
            elements.append(Paragraph(cmd.replace("&", "&amp;").replace("<", "&lt;"), mono_style))

    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Generated automatically by AESA - AI-assisted, human review recommended before action.", small))

    doc.build(elements)
    return buffer.getvalue()
