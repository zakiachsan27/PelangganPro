import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// @ts-ignore - html-to-docx doesn't have TypeScript definitions
import HTMLtoDOCX from "html-to-docx";

// DeepSeek API Configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-f9c8729669814ce387a9a445d4fba08f";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

// Generate PDF from HTML using Puppeteer
export async function generatePDF(html: string): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("[PDF Generator] Error:", error);
    throw new Error("Failed to generate PDF");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate DOCX from HTML using html-to-docx
export async function generateDOCX(html: string): Promise<Buffer> {
  try {
    const docxBuffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });
    
    if (!docxBuffer) {
      throw new Error("DOCX generation returned empty buffer");
    }
    
    return Buffer.from(docxBuffer);
  } catch (error) {
    console.error("[DOCX Generator] Error:", error);
    throw new Error("Failed to generate DOCX");
  }
}

// DeepSeek Vision API - Analyze document image/PDF
export async function analyzeDocumentWithDeepSeek(imageBase64: string): Promise<{
  layout: string;
  colors: string[];
  fonts: string[];
  structure: string;
}> {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this document image. Provide detailed information about:
1. Layout structure (header, body, footer positioning)
2. Color scheme used (primary, secondary colors)
3. Fonts and typography (sizes, weights, families)
4. Overall structure (tables, sections, alignment)

Return your analysis in JSON format with these keys: layout, colors, fonts, structure`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse JSON from content (DeepSeek might wrap it in markdown)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("[DeepSeek Vision] Error:", error);
    throw new Error("Failed to analyze document with DeepSeek");
  }
}

// DeepSeek Chat API - Generate HTML/CSS from analysis
export async function generateTemplateWithDeepSeek(
  analysis: { layout: string; colors: string[]; fonts: string[]; structure: string }
): Promise<{ html: string; css: string; formSchema: any }> {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a document template generator. Create HTML and CSS code based on document analysis.
Use Tailwind CSS classes for styling.
Make templates responsive and print-friendly.
Use {{variable}} syntax for dynamic content.
For repeatable sections, use {{#section}}...{{/section}} syntax.

Return response in JSON format:
{
  "html": "complete HTML template with {{placeholders}}",
  "css": "additional CSS styles",
  "formSchema": {
    "fields": [
      { "name": "fieldName", "label": "Field Label", "type": "text|number|date|textarea|repeater", "required": true|false }
    ]
  }
}`,
          },
          {
            role: "user",
            content: `Create an HTML document template based on this analysis:
Layout: ${analysis.layout}
Colors: ${analysis.colors.join(", ")}
Fonts: ${analysis.fonts.join(", ")}
Structure: ${analysis.structure}`,
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse JSON from content
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("[DeepSeek Generator] Error:", error);
    throw new Error("Failed to generate template with DeepSeek");
  }
}

// Render template with data
export function renderTemplate(
  template: string,
  data: Record<string, any>,
  css: string
): string {
  let html = template.replace("{{css_styles}}", css);

  // Handle basic fields {{fieldName}}
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });

  // Handle repeater sections {{#sectionName}}...{{/sectionName}}
  html = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    const items = data[key];
    if (!Array.isArray(items)) return "";

    return items
      .map((item: any) => {
        let itemHtml = content;
        itemHtml = itemHtml.replace(/\{\{(\w+)\}\}/g, (m: string, k: string) => {
          return item[k] !== undefined ? String(item[k]) : m;
        });
        return itemHtml;
      })
      .join("");
  });

  return html;
}
