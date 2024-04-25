import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

const HTML_TEMPLATES = ["early-access"] as const;
type HtmlTemplate = (typeof HTML_TEMPLATES)[number];

export class HtmlTemplateService {
  constructor(
    private readonly templateMap: Record<string, HandlebarsTemplateDelegate>
  ) {}

  public static async init() {
    const templateMap: Record<string, HandlebarsTemplateDelegate> = {};

    for (const template of HTML_TEMPLATES) {
      const templatePath = path.join(
        "src",
        "email-templates",
        `${template}.hbs`
      );
      const templateContent = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = Handlebars.compile(templateContent);
      templateMap[template] = compiledTemplate;
    }

    return new HtmlTemplateService(templateMap);
  }

  renderTemplate(template: HtmlTemplate, data: any) {
    const compiledTemplate = this.templateMap[template];

    if (!compiledTemplate) {
      throw new Error(`Template not found: ${template}`);
    }

    return compiledTemplate(data);
  }
}
