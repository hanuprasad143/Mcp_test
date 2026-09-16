const { z } = require("zod");
const db = require("./dbQueries");

function registerTools(server) {
  server.registerTool(
    "list_categories",
    { title: "List product categories", description: "Returns all categories with subcategories.", inputSchema: {} },
    async () => textResult(await db.listCategories())
  );

  server.registerTool(
    "list_industries",
    { title: "List industries", description: "Returns all industries served.", inputSchema: {} },
    async () => textResult(await db.listIndustries())
  );

  server.registerTool(
    "search_products",
    {
      title: "Search products",
      description: "Search/filter the product catalog.",
      inputSchema: {
        keyword: z.string().optional(),
        category_slug: z.string().optional(),
        subcategory_slug: z.string().optional(),
        industry_slug: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(25),
      },
    },
    async (args) => textResult(await db.searchProducts(args))
  );

  server.registerTool(
    "get_product_details",
    {
      title: "Get full product details",
      description: "Full detail for one product by id or slug.",
      inputSchema: { id: z.number().int().optional(), slug: z.string().optional() },
    },
    async (args) => {
      try {
        return textResult(await db.getProductDetails(args));
      } catch (e) {
        return errorResult(e.message);
      }
    }
  );

  server.registerTool(
    "get_product_type_details",
    {
      title: "Get product variant/type details",
      description: "Full detail for one product variant.",
      inputSchema: { type_id: z.number().int() },
    },
    async (args) => {
      try {
        return textResult(await db.getProductTypeDetails(args));
      } catch (e) {
        return errorResult(e.message);
      }
    }
  );

  server.registerTool(
    "get_products_by_industry",
    {
      title: "Get products used in an industry",
      description: "Products/types tagged for a given industry.",
      inputSchema: { industry_slug: z.string() },
    },
    async (args) => textResult(await db.getProductsByIndustry(args))
  );

  server.registerTool(
    "list_blogs",
    {
      title: "List blog posts",
      description: "Lists blog posts, most recent first.",
      inputSchema: { top_only: z.boolean().default(false), limit: z.number().int().min(1).max(50).default(10) },
    },
    async (args) => textResult(await db.listBlogs(args))
  );

  server.registerTool(
    "get_blog",
    {
      title: "Get a blog post",
      description: "Full content of one blog post.",
      inputSchema: { id: z.number().int().optional(), slug: z.string().optional() },
    },
    async (args) => {
      try {
        return textResult(await db.getBlog(args));
      } catch (e) {
        return errorResult(e.message);
      }
    }
  );

  server.registerTool(
    "search_jobs",
    {
      title: "Search open jobs",
      description: "Lists open job postings.",
      inputSchema: {
        place: z.string().optional(),
        employment_type: z.string().optional(),
        industry: z.string().optional(),
        include_inactive: z.boolean().default(false),
      },
    },
    async (args) => textResult(await db.searchJobs(args))
  );

  server.registerTool(
    "get_job",
    {
      title: "Get a job posting",
      description: "Full detail for one job posting.",
      inputSchema: { id: z.number().int().optional(), slug: z.string().optional() },
    },
    async (args) => {
      try {
        return textResult(await db.getJob(args));
      } catch (e) {
        return errorResult(e.message);
      }
    }
  );

  server.registerTool(
    "list_success_stories",
    {
      title: "List success stories",
      description: "Customer success stories/case studies.",
      inputSchema: {
        category_type: z.string().optional(),
        product_type: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      },
    },
    async (args) => textResult(await db.listSuccessStories(args))
  );

  server.registerTool(
    "list_quality_documents",
    {
      title: "List quality/certification documents",
      description: "Certifications/compliance docs.",
      inputSchema: { document_type: z.string().optional() },
    },
    async (args) => textResult(await db.listQualityDocuments(args))
  );

  server.registerTool(
    "list_resources",
    {
      title: "List company resource pages",
      description: "General resource/content pages.",
      inputSchema: { page_type: z.string().optional(), category_id: z.number().int().optional() },
    },
    async (args) => textResult(await db.listResources(args))
  );

  server.registerTool(
    "submit_contact_inquiry",
    {
      title: "Submit a contact/sales inquiry",
      description: "Creates a new contact inquiry record, like the website's contact form.",
      inputSchema: {
        first_name: z.string(),
        last_name: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        company_name: z.string().optional(),
        preferred_language: z.string().optional(),
        request_details: z.string(),
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        postal_code: z.string().optional(),
        business_address: z.string().optional(),
        page: z.string().optional(),
        full_url: z.string().optional(),
      },
    },
    async (args) => textResult(await db.submitContactInquiry(args))
  );
}

function textResult(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function errorResult(message) {
  return { isError: true, content: [{ type: "text", text: message }] };
}

module.exports = { registerTools };
