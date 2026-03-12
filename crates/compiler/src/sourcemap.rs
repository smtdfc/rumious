use swc_common::{FileName, source_map::SourceMapGenConfig};

pub struct SourceMapConfig;

impl SourceMapGenConfig for SourceMapConfig {
    fn file_name_to_source(&self, f: &FileName) -> String {
        f.to_string()
    }
}
