import { beforeAll, describe, expect, it } from "bun:test";
import { HtmlTemplateService } from "../../src/html-template-service";

describe("HTML Template Service", () => {
  let htmlTemplateService: HtmlTemplateService;

  beforeAll(async () => {
    htmlTemplateService = await HtmlTemplateService.init();
  });

  it("should render a template", () => {
    const rendered = htmlTemplateService.renderTemplate("early-access", {});
    expect(rendered).toMatchSnapshot();
  });
});
