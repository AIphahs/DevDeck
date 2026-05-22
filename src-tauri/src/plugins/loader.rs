use super::registry::{PluginManifest, PluginRegistry};
use std::path::Path;
use tracing::{error, info};

pub struct PluginLoader {
    registry: PluginRegistry,
}

impl PluginLoader {
    pub fn new() -> Self {
        Self {
            registry: PluginRegistry::new(),
        }
    }

    pub fn load_from_dir(&mut self, plugins_dir: &Path) {
        if !plugins_dir.exists() {
            return;
        }

        let Ok(entries) = std::fs::read_dir(plugins_dir) else {
            error!("Cannot read plugins directory: {:?}", plugins_dir);
            return;
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                self.load_plugin(&path);
            }
        }
    }

    fn load_plugin(&mut self, plugin_dir: &Path) {
        let manifest_path = plugin_dir.join("manifest.json");
        let Ok(content) = std::fs::read_to_string(&manifest_path) else {
            return;
        };
        let Ok(manifest) = serde_json::from_str::<PluginManifest>(&content) else {
            error!("Invalid manifest at {:?}", manifest_path);
            return;
        };

        info!("Loaded plugin: {} v{}", manifest.name, manifest.version);
        self.registry.register(manifest);
    }

    pub fn registry(&self) -> &PluginRegistry {
        &self.registry
    }
}
