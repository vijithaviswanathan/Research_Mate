import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


def set_run_font(run, name, size=None, bold=None, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:ascii"), name)
    run._element.rPr.rFonts.set(qn("w:hAnsi"), name)
    if size is not None:
      run.font.size = Pt(size)
    if bold is not None:
      run.bold = bold
    if color is not None:
      run.font.color.rgb = RGBColor(*color)


def add_bullets(document, items):
    for item in items:
        paragraph = document.add_paragraph(style="List Bullet")
        run = paragraph.add_run(item)
        set_run_font(run, "Aptos", 10.5)


def add_metadata_block(document, analysis):
    meta_items = [
        ("Query", analysis["query"]),
        ("Analysis ID", analysis["analysisId"]),
        ("Paper Count", str(len(analysis["papers"]))),
    ]

    for label, value in meta_items:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.space_after = Pt(3)
        label_run = paragraph.add_run(f"{label}: ")
        set_run_font(label_run, "Aptos", 10.5, bold=True, color=(21, 93, 156))
        value_run = paragraph.add_run(value)
        set_run_font(value_run, "Aptos", 10.5)


def add_heading(document, text, level=1):
    paragraph = document.add_paragraph()
    if level == 1:
        paragraph.style = "Heading 1"
        size = 15
    elif level == 2:
        paragraph.style = "Heading 2"
        size = 12
    else:
        paragraph.style = "Heading 3"
        size = 11

    run = paragraph.add_run(text)
    set_run_font(run, "Aptos Display", size, bold=True, color=(20, 32, 51))


def add_paragraph(document, text):
    paragraph = document.add_paragraph()
    run = paragraph.add_run(text)
    set_run_font(run, "Aptos", 10.5)
    paragraph.paragraph_format.space_after = Pt(8)
    paragraph.paragraph_format.line_spacing = 1.15


def build_document(analysis):
    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title_run = title.add_run("ResearchMate Literature Brief")
    set_run_font(title_run, "Aptos Display", 22, bold=True, color=(20, 32, 51))

    subtitle = document.add_paragraph()
    subtitle_run = subtitle.add_run(
        "Structured synthesis of retrieved academic literature, generated from the current analysis workspace."
    )
    set_run_font(subtitle_run, "Aptos", 10.5, color=(92, 107, 128))

    add_metadata_block(document, analysis)

    add_heading(document, "Overview", 1)
    add_paragraph(document, analysis["synthesis"]["overview"])

    add_heading(document, "Themes", 2)
    add_bullets(document, analysis["synthesis"]["themes"])

    add_heading(document, "Research Trends", 2)
    add_bullets(document, analysis["synthesis"]["trends"])

    add_heading(document, "Research Gaps", 2)
    add_bullets(document, analysis["synthesis"]["researchGaps"])

    add_heading(document, "Future Directions", 2)
    add_bullets(document, analysis["synthesis"]["futureDirections"])

    methodology_note = analysis["synthesis"].get("methodologyNote")
    if methodology_note:
        add_heading(document, "Methodology Note", 2)
        add_paragraph(document, methodology_note)

    document.add_section(WD_SECTION.NEW_PAGE)
    add_heading(document, "Paper Review", 1)

    for index, paper in enumerate(analysis["papers"], start=1):
        add_heading(document, f"{index}. {paper['title']}", 2)
        add_paragraph(
            document,
            f"Source: {paper['source']} | Year: {paper.get('year') or 'Unknown'} | "
            f"Venue: {paper.get('venue') or 'Unknown'} | Relevance: {paper['relevanceScore']:.2f}",
        )

        if paper.get("url"):
            add_paragraph(document, f"Paper Link: {paper['url']}")

        if paper.get("authors"):
            add_paragraph(document, "Authors: " + ", ".join(paper["authors"]))

        add_heading(document, "Summary", 3)
        add_paragraph(document, paper["summary"])

        if paper.get("abstract"):
            add_heading(document, "Abstract", 3)
            add_paragraph(document, paper["abstract"])

        add_heading(document, "Key Contributions", 3)
        add_bullets(document, paper["keyContributions"] or ["No contribution notes captured."])

        add_heading(document, "Limitations", 3)
        add_bullets(document, paper["limitations"] or ["No limitations captured."])

        matched_terms = paper.get("matchedTerms") or []
        add_heading(document, "Matched Terms", 3)
        add_paragraph(document, ", ".join(matched_terms) if matched_terms else "None recorded.")

    return document


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build_literature_brief_docx.py <analysis.json> <output.docx>")

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    analysis = json.loads(input_path.read_text(encoding="utf-8"))
    document = build_document(analysis)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    document.save(output_path)


if __name__ == "__main__":
    main()
