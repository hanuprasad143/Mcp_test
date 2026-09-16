const { Type } = require("@google/genai");
const db = require("./dbQueries");

/**
 * Each entry: { declaration: Gemini FunctionDeclaration, handler: async (args) => data }
 * These call the SAME query functions your MCP tools use — same database,
 * same results — just invoked directly in Node instead of over the MCP
 * protocol. That's what lets this run with no public URL and no ngrok.
 */
const tools = [
  {
    declaration: {
      name: "list_categories",
      description: "Returns all product categories with their subcategories.",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    handler: () => db.listCategories(),
  },
  {
    declaration: {
      name: "list_industries",
      description: "Returns all industries the company serves.",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    handler: () => db.listIndustries(),
  },
  {
    declaration: {
      name: "search_products",
      description: "Search/filter the product catalog by keyword, category, subcategory, or industry.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING, description: "Free-text search across name/description" },
          category_slug: { type: Type.STRING },
          subcategory_slug: { type: Type.STRING },
          industry_slug: { type: Type.STRING },
          limit: { type: Type.INTEGER },
        },
      },
    },
    handler: (args) => db.searchProducts(args),
  },
  {
    declaration: {
      name: "get_product_details",
      description: "Full detail for one product (specs, features, downloads, insights, variants) by id or slug.",
      parameters: {
        type: Type.OBJECT,
        properties: { id: { type: Type.INTEGER }, slug: { type: Type.STRING } },
      },
    },
    handler: (args) => db.getProductDetails(args),
  },
  {
    declaration: {
      name: "get_product_type_details",
      description: "Full detail for one product variant/type by its type_id.",
      parameters: {
        type: Type.OBJECT,
        properties: { type_id: { type: Type.INTEGER } },
        required: ["type_id"],
      },
    },
    handler: (args) => db.getProductTypeDetails(args),
  },
  {
    declaration: {
      name: "get_products_by_industry",
      description: "Returns products/variants tagged as relevant to a given industry.",
      parameters: {
        type: Type.OBJECT,
        properties: { industry_slug: { type: Type.STRING } },
        required: ["industry_slug"],
      },
    },
    handler: (args) => db.getProductsByIndustry(args),
  },
  {
    declaration: {
      name: "list_blogs",
      description: "Lists blog posts, most recent first.",
      parameters: {
        type: Type.OBJECT,
        properties: { top_only: { type: Type.BOOLEAN }, limit: { type: Type.INTEGER } },
      },
    },
    handler: (args) => db.listBlogs(args),
  },
  {
    declaration: {
      name: "get_blog",
      description: "Full content of one blog post by id or slug.",
      parameters: {
        type: Type.OBJECT,
        properties: { id: { type: Type.INTEGER }, slug: { type: Type.STRING } },
      },
    },
    handler: (args) => db.getBlog(args),
  },
  {
    declaration: {
      name: "search_jobs",
      description: "Lists open job postings, optionally filtered by place, employment type, or industry.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          place: { type: Type.STRING },
          employment_type: { type: Type.STRING },
          industry: { type: Type.STRING },
          include_inactive: { type: Type.BOOLEAN },
        },
      },
    },
    handler: (args) => db.searchJobs(args),
  },
  {
    declaration: {
      name: "get_job",
      description: "Full detail for one job posting by id or slug.",
      parameters: {
        type: Type.OBJECT,
        properties: { id: { type: Type.INTEGER }, slug: { type: Type.STRING } },
      },
    },
    handler: (args) => db.getJob(args),
  },
  {
    declaration: {
      name: "list_success_stories",
      description: "Lists customer success stories/case studies.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          category_type: { type: Type.STRING },
          product_type: { type: Type.STRING },
          limit: { type: Type.INTEGER },
        },
      },
    },
    handler: (args) => db.listSuccessStories(args),
  },
  {
    declaration: {
      name: "list_quality_documents",
      description: "Lists quality/certification/compliance documents.",
      parameters: {
        type: Type.OBJECT,
        properties: { document_type: { type: Type.STRING } },
      },
    },
    handler: (args) => db.listQualityDocuments(args),
  },
  {
    declaration: {
      name: "list_resources",
      description: "Lists general company resource/content pages.",
      parameters: {
        type: Type.OBJECT,
        properties: { page_type: { type: Type.STRING }, category_id: { type: Type.INTEGER } },
      },
    },
    handler: (args) => db.listResources(args),
  },
  {
    declaration: {
      name: "submit_contact_inquiry",
      description:
        "Creates a new contact/sales inquiry, exactly like the website's contact form. Only use when the visitor explicitly gave their own contact details.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          first_name: { type: Type.STRING },
          last_name: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          company_name: { type: Type.STRING },
          request_details: { type: Type.STRING },
          country: { type: Type.STRING },
          city: { type: Type.STRING },
          page: { type: Type.STRING },
        },
        required: ["first_name", "email", "request_details"],
      },
    },
    handler: (args) => db.submitContactInquiry(args),
  },
];

const functionDeclarations = tools.map((t) => t.declaration);
const handlerByName = Object.fromEntries(tools.map((t) => [t.declaration.name, t.handler]));

module.exports = { functionDeclarations, handlerByName };
