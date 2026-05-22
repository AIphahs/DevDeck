use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub entry: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PluginStatus {
    Loaded,
    Disabled,
    Error(String),
}

#[derive(Debug)]
pub struct PluginRegistry {
    plugins: HashMap<String, (PluginManifest, PluginStatus)>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self {
            plugins: HashMap::new(),
        }
    }

    pub fn register(&mut self, manifest: PluginManifest) {
        self.plugins.insert(manifest.id.clone(), (manifest, PluginStatus::Loaded));
    }

    pub fn unregister(&mut self, id: &str) {
        self.plugins.remove(id);
    }

    pub fn get(&self, id: &str) -> Option<&(PluginManifest, PluginStatus)> {
        self.plugins.get(id)
    }

    pub fn list(&self) -> Vec<&PluginManifest> {
        self.plugins.values().map(|(m, _)| m).collect()
    }

    pub fn set_status(&mut self, id: &str, status: PluginStatus) {
        if let Some(entry) = self.plugins.get_mut(id) {
            entry.1 = status;
        }
    }
}
