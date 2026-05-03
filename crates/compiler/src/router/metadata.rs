pub struct PageMetadata {
    pub path: String,
    pub import_path: String,
    pub layout: Vec<String>,
}

pub struct LayoutMetadata {
    pub path: String,
    pub import_path: String,
    pub key: String,
    pub original_path: String,
}

pub struct RouteMetadata {
    pub layouts: Vec<LayoutMetadata>,
    pub pages: Vec<PageMetadata>,
}
