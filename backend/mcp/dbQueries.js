const pool = require("../config/db");

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function listCategories() {
  const categories = await query("SELECT id, name, slug FROM categories ORDER BY name");
  const subcategories = await query(
    "SELECT id, category_id, name, slug, link FROM subcategories ORDER BY name"
  );
  return categories.map((c) => ({
    ...c,
    subcategories: subcategories.filter((s) => s.category_id === c.id),
  }));
}

async function listIndustries() {
  return query("SELECT id, name, slug FROM industries ORDER BY name");
}

async function searchProducts({ keyword, category_slug, subcategory_slug, industry_slug, limit = 25 }) {
  const conditions = [];
  const params = [];
  let joins = `
    FROM products p
    JOIN subcategories sc ON sc.id = p.subcategory_id
    JOIN categories c ON c.id = sc.category_id
  `;
  if (industry_slug) {
    joins += `
      JOIN product_industries pi ON pi.product_id = p.id
      JOIN industries ind ON ind.id = pi.industry_id AND ind.slug = ?
    `;
    params.push(industry_slug);
  }
  if (keyword) {
    conditions.push("(p.name LIKE ? OR p.short_description LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category_slug) {
    conditions.push("c.slug = ?");
    params.push(category_slug);
  }
  if (subcategory_slug) {
    conditions.push("sc.slug = ?");
    params.push(subcategory_slug);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT DISTINCT p.id, p.name, p.slug, p.serial_number, p.short_description,
           p.banner_image, p.has_types, c.name AS category, sc.name AS subcategory
    ${joins} ${where}
    ORDER BY p.menu_order, p.name
    LIMIT ?
  `;
  params.push(limit);
  return query(sql, params);
}

async function getProductDetails({ id, slug }) {
  if (!id && !slug) throw new Error("Provide either 'id' or 'slug'.");
  const where = id ? "p.id = ?" : "p.slug = ?";
  const rows = await query(
    `SELECT p.*, sc.name AS subcategory, c.name AS category
     FROM products p
     JOIN subcategories sc ON sc.id = p.subcategory_id
     JOIN categories c ON c.id = sc.category_id
     WHERE ${where}`,
    [id ?? slug]
  );
  const product = rows[0];
  if (!product) throw new Error("No product found for that id/slug.");

  const pid = product.id;
  const [descriptions, specifications, features, downloads, insights, sections, industries, types] =
    await Promise.all([
      query("SELECT id, title, subtitle, content, image FROM product_descriptions WHERE product_id = ?", [pid]),
      query(
        `SELECT s.id, s.title,
                (SELECT GROUP_CONCAT(value SEPARATOR ' | ') FROM product_specification_values WHERE specification_id = s.id) AS values_
         FROM product_specifications s WHERE s.product_id = ?`,
        [pid]
      ),
      query("SELECT id, feature FROM product_features WHERE product_id = ?", [pid]),
      query(
        "SELECT id, product_type, document_type, language, title, file_url FROM product_downloads WHERE product_id = ?",
        [pid]
      ),
      query("SELECT id, title, content FROM product_insights WHERE product_id = ?", [pid]),
      query(
        "SELECT id, type, title, content, file, step FROM product_sections WHERE product_id = ? ORDER BY step",
        [pid]
      ),
      query(
        `SELECT i.id, i.name, i.slug FROM industries i
         JOIN product_industries pi ON pi.industry_id = i.id WHERE pi.product_id = ?`,
        [pid]
      ),
      product.has_types
        ? query("SELECT id, product_type, name, short_description, image FROM product_types WHERE product_id = ?", [pid])
        : Promise.resolve([]),
    ]);

  return {
    product,
    descriptions,
    specifications: specifications.map((s) => ({ id: s.id, title: s.title, values: s.values_ ? s.values_.split(" | ") : [] })),
    features,
    downloads,
    insights,
    sections,
    industries,
    types,
  };
}

async function getProductTypeDetails({ type_id }) {
  const rows = await query("SELECT * FROM product_types WHERE id = ?", [type_id]);
  const type = rows[0];
  if (!type) throw new Error("No product type found for that id.");

  const [descriptions, specifications, features, downloads, insights] = await Promise.all([
    query("SELECT id, title, subtitle, content, image, show_explore FROM type_descriptions WHERE type_id = ?", [type_id]),
    query(
      `SELECT s.id, s.title,
              (SELECT GROUP_CONCAT(value SEPARATOR ' | ') FROM type_specification_values WHERE specification_id = s.id) AS values_
       FROM type_specifications s WHERE s.type_id = ?`,
      [type_id]
    ),
    query("SELECT id, feature FROM type_features WHERE type_id = ?", [type_id]),
    query("SELECT id, product_type, document_type, language, title, file_url FROM type_downloads WHERE type_id = ?", [type_id]),
    query("SELECT id, title, content FROM type_insights WHERE type_id = ?", [type_id]),
  ]);

  return {
    type,
    descriptions,
    specifications: specifications.map((s) => ({ id: s.id, title: s.title, values: s.values_ ? s.values_.split(" | ") : [] })),
    features,
    downloads,
    insights,
  };
}

async function getProductsByIndustry({ industry_slug }) {
  const products = await query(
    `SELECT p.id, p.name, p.slug, p.short_description
     FROM products p
     JOIN product_industries pi ON pi.product_id = p.id
     JOIN industries i ON i.id = pi.industry_id
     WHERE i.slug = ?`,
    [industry_slug]
  );
  const types = await query(
    `SELECT pt.id, pt.name, pt.product_id, p.name AS parent_product
     FROM product_types pt
     JOIN product_type_industries pti ON pti.product_type_id = pt.id
     JOIN industries i ON i.id = pti.industry_id
     JOIN products p ON p.id = pt.product_id
     WHERE i.slug = ?`,
    [industry_slug]
  );
  return { products, product_types: types };
}

async function listBlogs({ top_only = false, limit = 10 }) {
  const where = top_only ? "WHERE is_top_post = 1" : "";
  return query(
    `SELECT id, title, slug, date, img, is_top_post, top_position, link
     FROM blogs ${where} ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
}

async function getBlog({ id, slug }) {
  if (!id && !slug) throw new Error("Provide either 'id' or 'slug'.");
  const where = id ? "id = ?" : "slug = ?";
  const rows = await query(`SELECT * FROM blogs WHERE ${where}`, [id ?? slug]);
  if (!rows[0]) throw new Error("No blog post found.");
  return rows[0];
}

async function searchJobs({ place, employment_type, industry, include_inactive = false }) {
  const conditions = [];
  const params = [];
  if (!include_inactive) conditions.push("status = 'active'");
  if (place) {
    conditions.push("place LIKE ?");
    params.push(`%${place}%`);
  }
  if (employment_type) {
    conditions.push("employment_type = ?");
    params.push(employment_type);
  }
  if (industry) {
    conditions.push("industry = ?");
    params.push(industry);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query(
    `SELECT id, title, slug, tag, date, place, employment_type, experience, role, industry, status
     FROM jobs ${where} ORDER BY date DESC`,
    params
  );
}

async function getJob({ id, slug }) {
  if (!id && !slug) throw new Error("Provide either 'id' or 'slug'.");
  const where = id ? "id = ?" : "slug = ?";
  const rows = await query(`SELECT * FROM jobs WHERE ${where}`, [id ?? slug]);
  if (!rows[0]) throw new Error("No job found.");
  return rows[0];
}

async function listSuccessStories({ category_type, product_type, limit = 20 }) {
  const conditions = [];
  const params = [];
  if (category_type) {
    conditions.push("category_type = ?");
    params.push(category_type);
  }
  if (product_type) {
    conditions.push("product_type = ?");
    params.push(product_type);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query(
    `SELECT id, title, slug, category_type, product_type, sidebar_title, label, image
     FROM success_stories ${where} ORDER BY created_at DESC LIMIT ?`,
    [...params, limit]
  );
}

async function listQualityDocuments({ document_type }) {
  const where = document_type ? "WHERE document_type = ?" : "";
  return query(
    `SELECT id, document_type, pdf_name, pdf_file, image FROM quality ${where} ORDER BY created_at DESC`,
    document_type ? [document_type] : []
  );
}

async function listResources({ page_type, category_id }) {
  const conditions = [];
  const params = [];
  if (page_type) {
    conditions.push("page_type = ?");
    params.push(page_type);
  }
  if (category_id) {
    conditions.push("category_id = ?");
    params.push(category_id);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query(
    `SELECT id, category_id, subcategory_id, page_type, slug, title, description, image, link
     FROM resources ${where} ORDER BY created_at DESC`,
    params
  );
}

async function submitContactInquiry(input) {
  const fields = [
    "first_name", "last_name", "email", "phone", "company_name", "preferred_language",
    "request_details", "country", "state", "city", "postal_code", "business_address",
    "page", "full_url",
  ];
  const values = fields.map((f) => input[f] ?? null);
  const result = await query(
    `INSERT INTO contact_inquiries (${fields.join(", ")}, created_at)
     VALUES (${fields.map(() => "?").join(", ")}, NOW())`,
    values
  );
  return { success: true, inquiry_id: result.insertId };
}

module.exports = {
  listCategories,
  listIndustries,
  searchProducts,
  getProductDetails,
  getProductTypeDetails,
  getProductsByIndustry,
  listBlogs,
  getBlog,
  searchJobs,
  getJob,
  listSuccessStories,
  listQualityDocuments,
  listResources,
  submitContactInquiry,
};
